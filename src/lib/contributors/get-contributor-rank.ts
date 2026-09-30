import "server-only"

import { db, notes, users } from "@/db"
import { eq, sql } from "drizzle-orm"
import { getContributorBookmarkCount } from "../user/bookmarks"
import { calculateScore } from "./scoring"

export interface ContributorRank {
  contributorId: string
  rank: number
  score: number
  publishedNotes: number
  downloads: number
  views: number
  bookmarks: number
}
export async function getContributorRank(
  contributorId: string
): Promise<ContributorRank | null> {
  // Get all contributors' ranking data
  const rows = await db
    .select({
      contributorId: users.id,

      publishedNotes: sql<number>`
        COUNT(DISTINCT ${notes.id})::int
      `,

      downloads: sql<number>`
        COALESCE(SUM(${notes.downloadCount}), 0)::int
      `,

      views: sql<number>`
        COALESCE(SUM(${notes.viewCount}), 0)::int
      `,

      earliestAchievement: sql<Date>`
        MIN(${notes.publishedAt})
      `,
    })
    .from(users)
    .innerJoin(notes, eq(notes.contributorId, users.id))
    .where(eq(notes.status, "PUBLISHED"))
    .groupBy(users.id)

  const contributors = await Promise.all(
    rows.map(async (row) => {
      const publishedNotes = Number(row.publishedNotes)
      const downloads = Number(row.downloads)
      const views = Number(row.views)

      const bookmarks = await getContributorBookmarkCount(row.contributorId)

      const score = calculateScore({
        publishedNotes,
        downloads,
        views,
        bookmarks,
      })

      return {
        contributorId: row.contributorId,
        publishedNotes,
        downloads,
        views,
        bookmarks,
        earliestAchievement: row.earliestAchievement,
        score,
      }
    })
  )

  contributors.sort((a, b) => {
    // 1. Score
    if (b.score !== a.score) {
      return b.score - a.score
    }

    // 2. Downloads
    if (b.downloads !== a.downloads) {
      return b.downloads - a.downloads
    }

    // 3. Bookmarks
    if (b.bookmarks !== a.bookmarks) {
      return b.bookmarks - a.bookmarks
    }

    // 4. Views
    if (b.views !== a.views) {
      return b.views - a.views
    }

    // 5. Published notes
    if (b.publishedNotes !== a.publishedNotes) {
      return b.publishedNotes - a.publishedNotes
    }

    // 6. Earlier achievement
    const achievementDifference =
      (a.earliestAchievement?.getTime() ?? Infinity) -
      (b.earliestAchievement?.getTime() ?? Infinity)

    if (achievementDifference !== 0) {
      return achievementDifference
    }

    // 7. Deterministic fallback
    return a.contributorId.localeCompare(b.contributorId)
  })

  const index = contributors.findIndex(
    (contributor) => contributor.contributorId === contributorId
  )

  if (index === -1) {
    return null
  }

  const contributor = contributors[index]

  return {
    contributorId: contributor.contributorId,
    rank: index + 1,
    score: contributor.score,
    publishedNotes: contributor.publishedNotes,
    downloads: contributor.downloads,
    views: contributor.views,
    bookmarks: contributor.bookmarks,
  }
}
