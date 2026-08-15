import { ContributorPagination } from "@/components/admin/contributors/contributor-pagination"
import { ContributorSearch } from "@/components/admin/contributors/contributor-search"
import { ContributorSortSelect } from "@/components/admin/contributors/contributor-sort"
import { ContributorsEmptyState } from "@/components/admin/contributors/contributors-empty-state"
import { ContributorsGrid } from "@/components/admin/contributors/contributors-grid"
import { TopContributors } from "@/components/admin/contributors/top-contributors"
import {
  ContributorSort,
  getContributors,
  getContributorStats,
  getTopContributors,
} from "@/lib/admin/queries"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"
import { Metadata } from "next"
import { APP_NAME } from "@/constants/app.constants"
import { VALID_SORTS } from "@/app/(app)/contributors/page"
import { ContributorStatsSection } from "@/components/admin/contributors/contributor-stats"

export const metadata: Metadata = {
  title: "Contributors ",
  description: `Meet the students and learners sharing educational notes with the ${APP_NAME} community.`,
}

interface ContributorsPageProps {
  searchParams: Promise<{
    search?: string
    sort?: string
    page?: string
  }>
}

export default async function page({ searchParams }: ContributorsPageProps) {
  const params = await searchParams
  const search = params.search?.trim() || undefined
  const sort = VALID_SORTS.includes(params.sort as ContributorSort)
    ? (params.sort as ContributorSort)
    : "contributions"
  const page = Math.max(1, Number(params.page) || 1)

  const [stats, topContributors, contributorsResult] = await Promise.all([
    getContributorStats(),
    getTopContributors(),
    getContributors({ search, sort, page }),
  ])

  const { contributors, totalPages, totalCount } = contributorsResult
  const hasAnyContributors = stats.totalContributors > 0

  function buildHref(nextPage: number) {
    const p = new URLSearchParams()
    if (search) p.set("search", search)
    if (sort !== "contributions") p.set("sort", sort)
    if (nextPage > 1) p.set("page", String(nextPage))
    const qs = p.toString()
    return qs ? `/contributors?${qs}` : "/contributors"
  }

  return (
    <section className="my-0 space-y-6">
      <Heading>Contributors Overview</Heading>
      <ContributorStatsSection stats={stats} />

      {!hasAnyContributors ? (
        <div className="mx-auto">
          <ContributorsEmptyState variant="no-contributors" />
        </div>
      ) : (
        <>
          {topContributors.length > 0 && (
            <div className="mt-8">
              <TopContributors contributors={topContributors} admin />
            </div>
          )}

          <section className="mt-8">
            <div className="space-y-2">
              <Heading>All Contributors</Heading>
              <SubHeading>
                Students and learners sharing knowledge with the community.
              </SubHeading>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="sm:w-72">
                <ContributorSearch />
              </div>
              <ContributorSortSelect />
            </div>

            <div className="mt-6">
              {contributors.length === 0 ? (
                <ContributorsEmptyState variant="no-results" />
              ) : (
                <ContributorsGrid contributors={contributors} />
              )}
            </div>

            {totalCount > 0 && (
              <div className="mt-8">
                <ContributorPagination
                  page={contributorsResult.page}
                  totalPages={totalPages}
                  buildHref={buildHref}
                />
              </div>
            )}
          </section>
        </>
      )}
    </section>
  )
}
