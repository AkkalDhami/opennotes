import "server-only"

import { db, notes, users } from "@/db"
import { sql } from "drizzle-orm"

export interface ContributorRank {
  contributorId: string
  rank: number
  score: number
  publishedNotes: number
  downloads: number
}

export async function getContributorRank(
  contributorId: string
): Promise<ContributorRank | null> {
  const rows = await db
    .select({
      contributorId: users.id,

      publishedNotes: sql<number>`
        COUNT(${notes.id})::int
      `.as("published_notes"),

      downloads: sql<number>`
        COALESCE(SUM(${notes.downloadCount}), 0)::int
      `.as("downloads"),

      score: sql<number>`
        (
          COUNT(${notes.id}) * 10
          + COALESCE(SUM(${notes.downloadCount}), 0) * 2
        )::int
      `.as("score"),
    })
    .from(users)
    .leftJoin(
      notes,
      sql`
        ${notes.contributorId} = ${users.id}
        AND ${notes.status} = 'PUBLISHED'
      `
    )
    .groupBy(users.id)
    .orderBy(
      sql`
        (
          COUNT(${notes.id}) * 10
          + COALESCE(SUM(${notes.downloadCount}), 0) * 2
        ) DESC
      `
    )

  const index = rows.findIndex((row) => row.contributorId === contributorId)

  if (index === -1) {
    return null
  }

  const row = rows[index]

  const rank = index + 1

  return {
    contributorId: row.contributorId,
    rank,
    score: Number(row.score),
    publishedNotes: Number(row.publishedNotes),
    downloads: Number(row.downloads),
  }
}
