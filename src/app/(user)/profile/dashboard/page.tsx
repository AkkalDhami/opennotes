import { Metadata } from "next"
import { redirect } from "next/navigation"

import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ProfileContributions } from "@/components/profile/profile-contributions"
import { ContributionErrorState } from "@/components/contributions/contribution-error-state"
import { NoteStatus } from "@/db"
import { NOTE_STATUSES } from "@/validations/note"
import { SORT_OPTIONS, SortOption } from "@/types/profile"
import { getCurrentUserProfile } from "@/lib/user/get-profile"
import {
  getUserContributionFilterOptions,
  getUserContributions,
  getUserContributionStats,
} from "@/lib/user/get-contributions"
import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { getGreeting } from "@/utils/greeting"

export const metadata: Metadata = {
  title: "Overview",
  description:
    "See your activity, saved notes, collections, and contributions at a glance.",
}

interface ProfilePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function parseStatus(value: string | undefined): NoteStatus | "ALL" {
  if (!value || value === "ALL") return "ALL"
  return NOTE_STATUSES.includes(value as NoteStatus)
    ? (value as NoteStatus)
    : "ALL"
}

function parseSort(value: string | undefined): SortOption {
  return SORT_OPTIONS.includes(value as SortOption)
    ? (value as SortOption)
    : "newest"
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams

  const filters = {
    search: parseParam(params.search),
    status: parseStatus(parseParam(params.status)),
    subject: parseParam(params.subject),
    level: parseParam(params.level),
    course: parseParam(params.course),
    sort: parseSort(parseParam(params.sort)),
    page: Number(parseParam(params.page)) || 1,
  }

  let profile
  try {
    profile = await getCurrentUserProfile()
  } catch {
    // Never surface raw DB/auth errors to the client.
    profile = null
  }

  if (!profile) {
    redirect("/signin")
  }

  let contributionsResult
  let stats
  let filterOptions
  let loadError = false

  try {
    ;[contributionsResult, stats, filterOptions] = await Promise.all([
      getUserContributions(filters),
      getUserContributionStats(),
      getUserContributionFilterOptions(),
    ])
  } catch {
    loadError = true
    contributionsResult = {
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
    }
    stats = {
      total: 0,
      published: 0,
      pendingReview: 0,
      rejected: 0,
      draft: 0,
      removed: 0,
      totalDownloads: 0,
    }
    filterOptions = { subjectOptions: [], levelOptions: [], courseOptions: [] }
  }

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.status !== "ALL" ||
    Boolean(filters.subject) ||
    Boolean(filters.level) ||
    Boolean(filters.course) ||
    filters.sort !== "newest"

  const greeting = getGreeting(profile.name)

  return (
    <DashboardContainer>
      <PageHeader
        title={greeting}
        description="See your activity, saved notes, and contributions at a glance."
      />
      <ProfileHeader profile={profile} />
      <ProfileStats stats={stats} />

      {loadError ? (
        <ContributionErrorState />
      ) : (
        <ProfileContributions
          result={contributionsResult}
          hasActiveFilters={hasActiveFilters}
          filterOptions={filterOptions}
        />
      )}
    </DashboardContainer>
  )
}
