import "server-only"

import { db, notes, users, downloads } from "@/db"
import { eq, sql } from "drizzle-orm"

export interface ContributorRanking {
  rank: number
  userId: string
  name: string
  username: string
  avatarUrl: string | null

  publishedNotes: number
  downloads: number
  score: number
}

export async function getContributorsRanking(
  limit = 12
): Promise<ContributorRanking[]> {
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,

      publishedNotes: sql<number>`
        COUNT(DISTINCT ${notes.id})::int
      `.as("published_notes"),

      downloads: sql<number>`
        COALESCE((
          SELECT COUNT(*)
          FROM ${downloads}
          INNER JOIN ${notes} n2
            ON n2.id = ${downloads.noteId}
          WHERE n2.contributor_id = ${users.id}
        ), 0)::int
      `.as("downloads"),
    })
    .from(users)
    .innerJoin(notes, eq(notes.contributorId, users.id))
    .where(eq(notes.status, "PUBLISHED"))
    .groupBy(users.id, users.name, users.username, users.avatarUrl)

  const ranked = rows
    .map((row) => {
      const publishedNotes = Number(row.publishedNotes)
      const downloadsCount = Number(row.downloads)

      const score = publishedNotes * 10 + downloadsCount * 3

      return {
        userId: row.userId,
        name: row.name,
        username: row.username,
        avatarUrl: row.avatarUrl,

        publishedNotes,
        downloads: downloadsCount,

        score,
      }
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }

      if (b.publishedNotes !== a.publishedNotes) {
        return b.publishedNotes - a.publishedNotes
      }

      return b.downloads - a.downloads
    })
    .slice(0, limit)

  return ranked.map((contributor, index) => {
    const rank = index + 1

    return {
      ...contributor,
      rank,
    }
  })
}
