import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { APP_NAME } from "@/constants/app.constants"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { FileUploadIcon } from "@hugeicons/core-free-icons"

import { ProfileContributions } from "@/components/profile/profile-contributions"
import { ContributionErrorState } from "@/components/contributions/contribution-error-state"
import { Button } from "@/components/ui/button"
import {
  getUserContributionFilterOptions,
  getUserContributions,
} from "@/lib/user/get-contributions"
import {
  parseNotesView,
  parseParam,
  parseSort,
  parseStatus,
} from "@/lib/user/parse-contribution-filters"

export const metadata: Metadata = {
  title: "My Notes",
  description: `View and manage the notes you have shared on ${APP_NAME}.`,
}

export default async function page(props: PageProps<"/profile/notes">) {
  const params = (await props.searchParams) as Record<
    string,
    string | string[] | undefined
  >

  const filters = {
    search: parseParam(params.search),
    status: parseStatus(parseParam(params.status)),
    subject: parseParam(params.subject),
    level: parseParam(params.level),
    course: parseParam(params.course),
    sort: parseSort(parseParam(params.sort)),
    page: Number(parseParam(params.page)) || 1,
  }
  const view = parseNotesView(parseParam(params.view))

  let contributionsResult
  let filterOptions
  let loadError = false

  try {
    ;[contributionsResult, filterOptions] = await Promise.all([
      getUserContributions(filters),
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
    filterOptions = { subjectOptions: [], levelOptions: [], courseOptions: [] }
  }

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.status !== "ALL" ||
    Boolean(filters.subject) ||
    Boolean(filters.level) ||
    Boolean(filters.course) ||
    filters.sort !== "newest"

  return (
    <DashboardContainer>
      <PageHeader
        title="My Notes"
        description="View and manage the notes you have shared."
      >
        <Button
          nativeButton={false}
          className="gap-2"
          render={
            <Link href="/contribution">
              <HugeiconsIcon
                icon={FileUploadIcon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
              Share notes
            </Link>
          }
        />
      </PageHeader>

      {loadError ? (
        <ContributionErrorState />
      ) : (
        <ProfileContributions
          result={contributionsResult}
          hasActiveFilters={hasActiveFilters}
          view={view}
          filterOptions={filterOptions}
        />
      )}
    </DashboardContainer>
  )
}
