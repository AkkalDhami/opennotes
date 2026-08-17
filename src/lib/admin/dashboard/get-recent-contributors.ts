import { cache } from "react"
import { desc, eq, sql } from "drizzle-orm"

import { db, notes, users } from "@/db"

export type RecentContributor = {
  id: string
  name: string
  username: string
  avatarUrl: string | null
  joinedAt: Date
  noteCount: number
  totalDownloads: number
}

export const getRecentContributors = cache(
  async (limit = 6): Promise<RecentContributor[]> => {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
        joinedAt: users.createdAt,
        noteCount: sql<string>`count(${notes.id})`,
        totalDownloads: sql<string>`coalesce(sum(${notes.downloadCount}), 0)`,
      })
      .from(users)
      .innerJoin(notes, eq(notes.contributorId, users.id))
      .groupBy(users.id)
      .orderBy(desc(users.createdAt))
      .limit(limit)

    return rows.map((r) => ({
      ...r,
      noteCount: Number(r.noteCount),
      totalDownloads: Number(r.totalDownloads),
    }))
  }
)
