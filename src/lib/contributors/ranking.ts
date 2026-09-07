import { eq, sql } from "drizzle-orm"
import { db } from "@/db"
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
  const rows = await db
    .select({
      userId: notes.contributorId,
      publishedNotes: sql<number>`count(*)::int`,
      downloads: sql<number>`coalesce(sum(${notes.downloadCount}), 0)::int`,
      views: sql<number>`coalesce(sum(${notes.viewCount}), 0)::int`,
    })
    .from(notes)
    .where(eq(notes.status, "PUBLISHED"))
    .groupBy(notes.contributorId)

  return rows
    .map((row) => ({ ...row, score: calculateScore(row) }))
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({ ...row, rank: index + 1 }))
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const full = await computeFullLeaderboard()
  return full.slice(0, limit)
}

export async function getContributorRank(
  userId: string
): Promise<number | null> {
  const full = await computeFullLeaderboard()
  const entry = full.find((row) => row.userId === userId)
  return entry ? entry.rank : null
}
