import { cache } from "react"
import { and, count, eq, gte } from "drizzle-orm"

import { db } from "@/db"
import { notes } from "@/db"
import { reports } from "@/db"

export type ModerationStats = {
  pendingNotes: number
  openReports: number
  rejectedNotes: number
  recentlyRemoved: number
}

const n = (v: string | number | null | undefined) => Number(v ?? 0)

export const getModerationStats = cache(async (): Promise<ModerationStats> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [pendingRow, reportsRow, rejectedRow, removedRow] = await Promise.all([
    db
      .select({ value: count() })
      .from(notes)
      .where(eq(notes.status, "PENDING_REVIEW")),

    db
      .select({ value: count() })
      .from(reports)
      .where(eq(reports.status, "OPEN")),

    db
      .select({ value: count() })
      .from(notes)
      .where(eq(notes.status, "REJECTED")),

    // "Recently Removed" is scoped to the last 30 days via updatedAt (the
    // timestamp that flips when a note's status changes to REMOVED).
    db
      .select({ value: count() })
      .from(notes)
      .where(
        and(eq(notes.status, "REMOVED"), gte(notes.updatedAt, thirtyDaysAgo))
      ),
  ])

  return {
    pendingNotes: n(pendingRow[0]?.value),
    openReports: n(reportsRow[0]?.value),
    rejectedNotes: n(rejectedRow[0]?.value),
    recentlyRemoved: n(removedRow[0]?.value),
  }
})
