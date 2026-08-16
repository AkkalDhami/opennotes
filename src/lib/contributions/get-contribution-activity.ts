import "server-only"

import { db, notes } from "@/db"
import { and, eq, gte, lt, sql } from "drizzle-orm"

export interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface ContributionActivity {
  year: number
  total: number
  activeDays: number
  longestStreak: number
  days: ContributionDay[]
}

interface GetContributionActivityOptions {
  contributorId: string
  year?: number
}

function getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

function getLongestStreak(days: ContributionDay[]): number {
  let current = 0
  let longest = 0

  for (const day of days) {
    if (day.count > 0) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 0
    }
  }

  return longest
}

export async function getContributionActivity({
  contributorId,
  year = new Date().getFullYear(),
}: GetContributionActivityOptions): Promise<ContributionActivity> {
  const startDate = new Date(Date.UTC(year, 0, 1))
  const endDate = new Date(Date.UTC(year + 1, 0, 1))

  const rows = await db
    .select({
      date: sql<string>`
        TO_CHAR(DATE(${notes.createdAt}), 'YYYY-MM-DD')
      `.as("date"),

      count: sql<number>`
        COUNT(*)::int
      `.as("count"),
    })
    .from(notes)
    .where(
      and(
        eq(notes.contributorId, contributorId),
        eq(notes.status, "PUBLISHED"),
        gte(notes.createdAt, startDate),
        lt(notes.createdAt, endDate)
      )
    )
    .groupBy(sql`DATE(${notes.createdAt})`)
    .orderBy(sql`DATE(${notes.createdAt})`)

  const counts = new Map(rows.map((row) => [row.date, Number(row.count)]))

  const days: ContributionDay[] = []

  const current = new Date(startDate)

  while (current < endDate) {
    const date = current.toISOString().slice(0, 10)
    const count = counts.get(date) ?? 0

    days.push({
      date,
      count,
      level: getContributionLevel(count),
    })

    current.setUTCDate(current.getUTCDate() + 1)
  }

  const total = days.reduce((sum, day) => sum + day.count, 0)

  const activeDays = days.filter((day) => day.count > 0).length

  const longestStreak = getLongestStreak(days)

  return {
    year,
    total,
    activeDays,
    longestStreak,
    days,
  }
}
