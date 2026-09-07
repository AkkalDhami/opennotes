import { calculateContributorScore, type ContributorMetrics } from "./scoring"
import { syncContributorBadges } from "./badges"
import { getContributorRank } from "./ranking"

export interface ContributorSummary extends ContributorMetrics {
  rank: number | null
}

/**
 * The single function admin note actions should call after any moderation
 * transition that changes a note's eligibility (publish / remove / restore).
 * It recomputes metrics from current state and reconciles badges — it does
 * not, and does not need to, know anything about *why* it was called.
 *
 * Safe to call multiple times in a row (page refresh, retried request,
 * duplicate click) — every step it delegates to is itself idempotent.
 */
export async function syncContributorAchievements(
  userId: string
): Promise<ContributorMetrics> {
  const metrics = await calculateContributorScore(userId)
  await syncContributorBadges(userId, metrics)
  return metrics
}

/** Alias matching the naming used in the spec's §11 recalculation flow. */
export const recalculateContributor = syncContributorAchievements

/** Full dashboard/profile view: metrics + current rank in one call. */
export async function getContributorSummary(
  userId: string
): Promise<ContributorSummary> {
  const [metrics, rank] = await Promise.all([
    calculateContributorScore(userId),
    getContributorRank(userId),
  ])
  return { ...metrics, rank }
}
