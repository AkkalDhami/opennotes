import "server-only"

import { and, eq, gte, lt, sql } from "drizzle-orm"
import { db, notes } from "@/db"
import { CONTRIBUTOR_SCORE } from "@/constants/badge.constants"

export interface ContributorChartMonth {
  month: string
  publishedNotes: number
  contributionPoints: number
}

export async function getContributorChartData(
  contributorId: string,
  year = new Date().getFullYear()
): Promise<ContributorChartMonth[]> {
  const start = new Date(Date.UTC(year, 0, 1))
  const end = new Date(Date.UTC(year + 1, 0, 1))
  const rows = await db
    .select({
      month: sql<number>`extract(month from ${notes.publishedAt})::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(notes)
    .where(
      and(
        eq(notes.contributorId, contributorId),
        eq(notes.status, "PUBLISHED"),
        gte(notes.publishedAt, start),
        lt(notes.publishedAt, end)
      )
    )
    .groupBy(sql`extract(month from ${notes.publishedAt})`)

  const byMonth = new Map(
    rows.map((row) => [Number(row.month), Number(row.count)])
  )
  return Array.from({ length: 12 }, (_, index) => {
    const publishedNotes = byMonth.get(index + 1) ?? 0
    return {
      month: new Intl.DateTimeFormat("en", {
        month: "short",
        timeZone: "UTC",
      }).format(new Date(Date.UTC(year, index, 1))),
      publishedNotes,
      contributionPoints: publishedNotes * CONTRIBUTOR_SCORE.PUBLISHED_NOTE,
    }
  })
}
