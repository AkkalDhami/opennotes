import type { Metadata } from "next"

import { ContributorPagination } from "@/components/admin/contributors/contributor-pagination"
import { ContributorSearch } from "@/components/admin/contributors/contributor-search"
import { ContributorSortSelect } from "@/components/admin/contributors/contributor-sort"
import { ContributorStatsSection } from "@/components/admin/contributors/contributor-stats"
import { ContributorsCta } from "@/components/admin/contributors/contributors-cta"
import { ContributorsEmptyState } from "@/components/admin/contributors/contributors-empty-state"
import { ContributorsGrid } from "@/components/admin/contributors/contributors-grid"
import { TopContributors } from "@/components/admin/contributors/top-contributors"
import {
  getContributors,
  getContributorStats,
  getTopContributors,
  type ContributorSort,
} from "@/components/admin/contributors/queries"
import { Container } from "@/components/ui/container"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"

export const metadata: Metadata = {
  title: "Contributors | NotesApp",
  description:
    "Meet the students and learners sharing educational notes with the NotesApp community.",
}

interface ContributorsPageProps {
  searchParams: Promise<{
    search?: string
    sort?: string
    page?: string
  }>
}

const VALID_SORTS: ContributorSort[] = ["contributions", "recent", "name"]

export default async function ContributorsPage({
  searchParams,
}: ContributorsPageProps) {
  const params = await searchParams
  const search = params.search?.trim() || undefined
  const sort = VALID_SORTS.includes(params.sort as ContributorSort)
    ? (params.sort as ContributorSort)
    : "contributions"
  const page = Math.max(1, Number(params.page) || 1)

  // Top Contributors is a "best of everyone" spotlight, so it's skipped
  // while actively searching — otherwise a filtered search would show
  // podium cards unrelated to the query above the filtered grid.
  const [stats, topContributors, contributorsResult] = await Promise.all([
    getContributorStats(),
    search ? Promise.resolve([]) : getTopContributors(),
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
    <Container className="space-y-6 border-x px-4 pt-4 pb-6">
      <div className="mb-6 space-y-3">
        <Heading>Meet the Contributors</Heading>
        <SubHeading>
          Meet the students and learners helping make quality educational notes
          accessible to everyone
        </SubHeading>
      </div>

      <ContributorStatsSection stats={stats} />

      {!hasAnyContributors ? (
        <div className="mx-auto">
          <ContributorsEmptyState variant="no-contributors" />
        </div>
      ) : (
        <>
          {topContributors.length > 0 && (
            <div className="mt-16">
              <TopContributors contributors={topContributors} />
            </div>
          )}

          <section className="mt-16 px-4">
            <div className="">
              <h2 className="text-xl font-semibold text-foreground">
                All Contributors
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Students and learners sharing knowledge with the community.
              </p>
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

      <div className="">
        <ContributorsCta />
      </div>
    </Container>
  )
}
