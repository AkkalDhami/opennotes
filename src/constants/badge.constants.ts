/** Points awarded per unit of eligible contribution. */
export const CONTRIBUTOR_SCORE = {
  PUBLISHED_NOTE: 100,
  DOWNLOAD: 1,
  VIEW: 0.1,
} as const

/** Inclusive score bands. Bands must be contiguous and cover 0 → Infinity. */
export const CONTRIBUTOR_TIERS = [
  { tier: 0, label: "Unranked", min: 0, max: 99 },
  { tier: 1, label: "Tier 1", min: 100, max: 499 },
  { tier: 2, label: "Tier 2", min: 500, max: 1_499 },
  { tier: 3, label: "Tier 3", min: 1_500, max: 4_999 },
  { tier: 4, label: "Tier 4", min: 5_000, max: 9_999 },
  { tier: 5, label: "Tier 5", min: 10_000, max: Number.POSITIVE_INFINITY },
] as const

export type ContributorTierInfo = (typeof CONTRIBUTOR_TIERS)[number]

/** Minimum distinct calendar months with a published note to count as "consistent". */
export const CONSISTENCY_MONTHS_THRESHOLD = 3

/** Minimum distinct subjects across published notes to count as "multi-subject". */
export const MULTI_SUBJECT_THRESHOLD = 3
