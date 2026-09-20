import "server-only"

import { db, notes, users } from "@/db"
import { eq, sql } from "drizzle-orm"
import { calculateScore } from "./scoring"

export interface ContributorRanking {
  rank: number
  userId: string
  name: string
  username: string
  avatarUrl: string | null

  publishedNotes: number
  downloads: number
  views: number
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
        COALESCE(SUM(${notes.downloadCount}), 0)::int
      `.as("downloads"),

      views: sql<number>`
        COALESCE(SUM(${notes.viewCount}), 0)::int
      `.as("views"),

      earliestAchievement: sql<Date>`
        MIN(${notes.publishedAt})
      `.as("earliest_achievement"),
    })
    .from(users)
    .innerJoin(notes, eq(notes.contributorId, users.id))
    .where(eq(notes.status, "PUBLISHED"))
    .groupBy(users.id, users.name, users.username, users.avatarUrl)

  const ranked = rows
    .map((row) => {
      const publishedNotes = Number(row.publishedNotes)
      const downloadsCount = Number(row.downloads)
      const views = Number(row.views)

      const score = calculateScore({
        publishedNotes,
        downloads: downloadsCount,
        views,
      })

      return {
        userId: row.userId,
        name: row.name,
        username: row.username,
        avatarUrl: row.avatarUrl,

        publishedNotes,
        downloads: downloadsCount,
        views,
        earliestAchievement: row.earliestAchievement,

        score,
      }
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }

      if (b.downloads !== a.downloads) {
        return b.downloads - a.downloads
      }

      if (b.views !== a.views) {
        return b.views - a.views
      }

      if (b.publishedNotes !== a.publishedNotes) {
        return b.publishedNotes - a.publishedNotes
      }

      const achievementDifference =
        a.earliestAchievement.getTime() - b.earliestAchievement.getTime()

      if (achievementDifference !== 0) {
        return achievementDifference
      }

      return a.userId.localeCompare(b.userId)
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
