import { cache } from "react"
import { desc, eq, sql } from "drizzle-orm"

import { db } from "@/db"
import { notes } from "@/db"
import { users } from "@/db"

export type TopContributor = {
  id: string
  name: string
  username: string
  avatarUrl: string | null
  publishedCount: number
  totalDownloads: number
}

export const getTopContributors = cache(
  async (limit = 3): Promise<TopContributor[]> => {
    const publishedCount = sql<string>`count(${notes.id}) filter (where ${notes.status} = 'PUBLISHED')`
    const totalDownloads = sql<string>`coalesce(sum(${notes.downloadCount}) filter (where ${notes.status} = 'PUBLISHED'), 0)`

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
        publishedCount,
        totalDownloads,
      })
      .from(users)
      .innerJoin(notes, eq(notes.contributorId, users.id))
      .groupBy(users.id)
      .having(
        sql`count(${notes.id}) filter (where ${notes.status} = 'PUBLISHED') > 0`
      )
      .orderBy(desc(publishedCount), desc(totalDownloads))
      .limit(limit)

    return rows.map((r) => ({
      ...r,
      publishedCount: Number(r.publishedCount),
      totalDownloads: Number(r.totalDownloads),
    }))
  }
)
