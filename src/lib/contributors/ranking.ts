import { eq, sql } from "drizzle-orm"
import { bookmarks, db } from "@/db"
import { notes } from "@/db/"
import { calculateScore } from "./scoring"

export interface LeaderboardEntry {
  userId: string
  publishedNotes: number
  downloads: number
  views: number
  score: number
  rank: number
}

async function computeFullLeaderboard(): Promise<LeaderboardEntry[]> {
  const bookmarkCounts = db
    .select({
      userId: notes.contributorId,
      bookmarks: sql<number>`
        count(${bookmarks.noteId})::int
      `,
    })
    .from(bookmarks)
    .innerJoin(notes, eq(bookmarks.noteId, notes.id))
    .where(eq(notes.status, "PUBLISHED"))
    .groupBy(notes.contributorId)
    .as("bookmark_counts")

  const rows = await db
    .select({
      userId: notes.contributorId,

      publishedNotes: sql<number>`
        count(*)::int
      `,

      downloads: sql<number>`
        coalesce(sum(${notes.downloadCount}), 0)::int
      `,

      views: sql<number>`
        coalesce(sum(${notes.viewCount}), 0)::int
      `,

      bookmarks: sql<number>`
        coalesce(${bookmarkCounts.bookmarks}, 0)::int
      `,
    })
    .from(notes)
    .leftJoin(bookmarkCounts, eq(notes.contributorId, bookmarkCounts.userId))
    .where(eq(notes.status, "PUBLISHED"))
    .groupBy(notes.contributorId, bookmarkCounts.bookmarks)

  return rows
    .map((row) => ({
      ...row,
      score: calculateScore(row),
    }))
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }))
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const full = await computeFullLeaderboard()
  return full.slice(0, limit)
}

// export async function getContributorRank(
//   userId: string
// ): Promise<number | null> {
//   const full = await computeFullLeaderboard()
//   const entry = full.find((row) => row.userId === userId)
//   return entry ? entry.rank : null
// }
