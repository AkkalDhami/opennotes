import { cache } from "react"
import { count, countDistinct, eq, gte, ne, sum } from "drizzle-orm"

import { db } from "@/db"
import { notes } from "@/db"
import { reports } from "@/db"

export type AdminStats = {
  totalNotes: number
  publishedNotes: number
  pendingReview: number
  totalContributors: number
  totalDownloads: number
  openReports: number
  notesAddedLast30Days: number
  processingErrors: number
}

const n = (v: string | number | null | undefined) => Number(v ?? 0)

/**
 * Wrapped in React's `cache()` so multiple independent Server Components
 * (the stats grid and the content-health section both need these numbers)
 * share a single query per request instead of hitting the database twice.
 */
export const getAdminStats = cache(async (): Promise<AdminStats> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalNotesRow,
    publishedRow,
    pendingRow,
    contributorsRow,
    downloadsRow,
    reportsRow,
    recentRow,
    processingRow,
  ] = await Promise.all([
    db.select({ value: count() }).from(notes),

    db
      .select({ value: count() })
      .from(notes)
      .where(eq(notes.status, "PUBLISHED")),

    db
      .select({ value: count() })
      .from(notes)
      .where(eq(notes.status, "PENDING_REVIEW")),

    // "Users who have shared notes" — distinct contributors with at least
    // one non-draft note (a draft hasn't been shared with anyone yet).
    db
      .select({ value: countDistinct(notes.contributorId) })
      .from(notes)
      .where(ne(notes.status, "DRAFT")),

    // "Downloads across published notes" — sums the denormalized per-note
    // counter rather than counting raw download rows, since the counter is
    // what's already scoped to what's public.
    db
      .select({ value: sum(notes.downloadCount) })
      .from(notes)
      .where(eq(notes.status, "PUBLISHED")),

    db
      .select({ value: count() })
      .from(reports)
      .where(eq(reports.status, "OPEN")),

    db
      .select({ value: count() })
      .from(notes)
      .where(gte(notes.createdAt, thirtyDaysAgo)),

    db
      .select({ value: count() })
      .from(notes)
      .where(eq(notes.processingStatus, "FAILED")),
  ])

  return {
    totalNotes: n(totalNotesRow[0]?.value),
    publishedNotes: n(publishedRow[0]?.value),
    pendingReview: n(pendingRow[0]?.value),
    totalContributors: n(contributorsRow[0]?.value),
    totalDownloads: n(downloadsRow[0]?.value),
    openReports: n(reportsRow[0]?.value),
    notesAddedLast30Days: n(recentRow[0]?.value),
    processingErrors: n(processingRow[0]?.value),
  }
})
