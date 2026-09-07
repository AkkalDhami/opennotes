import {
  CONSISTENCY_MONTHS_THRESHOLD,
  MULTI_SUBJECT_THRESHOLD,
} from "@/constants/badge.constants"
import type { ContributorMetrics } from "./scoring"

export interface BadgeDefinition {
  slug: string
  name: string
  description: string
  tier: number
  qualifies: (metrics: ContributorMetrics) => boolean
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    slug: "first-contribution",
    name: "First Contribution",
    description: "Published your first note.",
    tier: 1,
    qualifies: (metrics) => metrics.publishedNotes >= 1,
  },
  {
    slug: "5-published-notes",
    name: "5 Published Notes",
    description: "Published 5 notes.",
    tier: 1,
    qualifies: (metrics) => metrics.publishedNotes >= 5,
  },
  {
    slug: "10-published-notes",
    name: "10 Published Notes",
    description: "Published 10 notes.",
    tier: 2,
    qualifies: (metrics) => metrics.publishedNotes >= 10,
  },
  {
    slug: "25-published-notes",
    name: "25 Published Notes",
    description: "Published 25 notes.",
    tier: 3,
    qualifies: (metrics) => metrics.publishedNotes >= 25,
  },
  {
    slug: "100-published-notes",
    name: "100 Published Notes",
    description: "Published 100 notes.",
    tier: 4,
    qualifies: (metrics) => metrics.publishedNotes >= 100,
  },
  {
    slug: "100-downloads",
    name: "100 Downloads",
    description: "Notes downloaded 100 times.",
    tier: 1,
    qualifies: (metrics) => metrics.downloads >= 100,
  },
  {
    slug: "1000-downloads",
    name: "1,000 Downloads",
    description: "Notes downloaded 1,000 times.",
    tier: 2,
    qualifies: (metrics) => metrics.downloads >= 1_000,
  },
  {
    slug: "10000-downloads",
    name: "10,000 Downloads",
    description: "Notes downloaded 10,000 times.",
    tier: 4,
    qualifies: (metrics) => metrics.downloads >= 10_000,
  },
  {
    slug: "multi-subject-contributor",
    name: "Multi-Subject Contributor",
    description: "Published notes across multiple subjects.",
    tier: 2,
    qualifies: (metrics) => metrics.distinctSubjects >= MULTI_SUBJECT_THRESHOLD,
  },
  {
    slug: "consistent-contributor",
    name: "Consistent Contributor",
    description: "Published notes in multiple months.",
    tier: 2,
    qualifies: (metrics) =>
      metrics.activeMonths >= CONSISTENCY_MONTHS_THRESHOLD,
  },
  {
    slug: "top-contributor",
    name: "Top Contributor",
    description: "Reached the highest contributor tier.",
    tier: 5,
    qualifies: (metrics) => metrics.tier >= 5,
  },
]
