import { calculateContributorScore, type ContributorMetrics } from "./scoring"
import { syncContributorBadges } from "./badges"
import { getContributorRank } from "./get-contributor-rank"

export interface ContributorSummary extends ContributorMetrics {
  rank: number | null
}

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
  return { ...metrics, rank: rank?.rank ?? null }
}
