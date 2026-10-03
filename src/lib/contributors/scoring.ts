import { and, eq, sql } from "drizzle-orm"
import { bookmarks, db } from "@/db"
import { notes } from "@/db"
import {
  CONSISTENCY_MONTHS_THRESHOLD,
  CONTRIBUTOR_SCORE,
  CONTRIBUTOR_TIERS,
  MULTI_SUBJECT_THRESHOLD,
} from "@/constants/badge.constants"

export interface ContributorRawCounts {
  publishedNotes: number
  downloads: number
  views: number
  bookmarks: number
  activeMonths: number
  distinctSubjects: number
}

export interface ContributorMetrics extends ContributorRawCounts {
  score: number
  tier: number
  tierLabel: string
}

const EMPTY_COUNTS: ContributorRawCounts = {
  publishedNotes: 0,
  downloads: 0,
  views: 0,
  bookmarks: 0,
  activeMonths: 0,
  distinctSubjects: 0,
}

/**
 * Pure function: counts -> score. Kept side-effect free and exported on its
 * own so it can be unit tested and reused by the leaderboard query without
 * hitting the database twice.
 */
export function calculateScore(
  counts: Pick<
    ContributorRawCounts,
    "publishedNotes" | "downloads" | "views" | "bookmarks"
  >
): number {
  const raw =
    counts.publishedNotes * CONTRIBUTOR_SCORE.PUBLISHED_NOTE +
    counts.downloads * CONTRIBUTOR_SCORE.DOWNLOAD +
    counts.views * CONTRIBUTOR_SCORE.VIEW +
    counts.bookmarks * CONTRIBUTOR_SCORE.BOOKMARK

  return Math.round(raw)
}

/** Pure function: score -> tier. */
export function calculateTier(score: number): { tier: number; label: string } {
  const band = CONTRIBUTOR_TIERS.find((t) => score >= t.min && score <= t.max)
  const fallback = CONTRIBUTOR_TIERS[CONTRIBUTOR_TIERS.length - 1]
  const resolved = band ?? fallback
  return { tier: resolved.tier, label: resolved.label }
}

/**
 * Fetches the raw eligible-contribution counts for a single contributor
 * directly from the `notes` table. No caching, no stored counters — this
 * always reflects the note table's current state.
 */

export async function getContributorRawCounts(
  userId: string
): Promise<ContributorRawCounts> {
  const [row] = await db
    .select({
      publishedNotes: sql<number>`count(distinct ${notes.id})::int`,

      downloads: sql<number>`
        coalesce(sum(${notes.downloadCount}), 0)::int
      `,

      views: sql<number>`
        coalesce(sum(${notes.viewCount}), 0)::int
      `,

      bookmarks: sql<number>`
        count(${bookmarks.noteId})::int
      `,

      activeMonths: sql<number>`
        count(distinct date_trunc('month', ${notes.publishedAt}))::int
      `,

      distinctSubjects: sql<number>`
        count(distinct ${notes.subject})::int
      `,
    })
    .from(notes)
    .leftJoin(bookmarks, eq(bookmarks.noteId, notes.id))
    .where(and(eq(notes.contributorId, userId), eq(notes.status, "PUBLISHED")))

  return row ?? EMPTY_COUNTS
}

export async function calculateContributorScore(
  userId: string
): Promise<ContributorMetrics> {
  const counts = await getContributorRawCounts(userId)
  const score = calculateScore(counts)
  const { tier, label } = calculateTier(score)

  return { ...counts, score, tier, tierLabel: label }
}

export const recalculateContributorScore = calculateContributorScore

export function isConsistentContributor(counts: ContributorRawCounts): boolean {
  return counts.activeMonths >= CONSISTENCY_MONTHS_THRESHOLD
}

export function isMultiSubjectContributor(
  counts: ContributorRawCounts
): boolean {
  return counts.distinctSubjects >= MULTI_SUBJECT_THRESHOLD
}
