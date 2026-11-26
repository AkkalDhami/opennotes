import { ContributorStatsSection } from "@/components/admin/contributors/contributor-stats"
import { ContributorsEmptyState } from "@/components/admin/contributors/contributors-empty-state"
import { TopContributors } from "@/components/admin/contributors/top-contributors"
import {
  AllContributorsSection,
  AllContributorsSectionFallback,
  type ContributorSearchParams,
} from "@/components/contributors/all-contributors-section"
import { getContributorStats } from "@/lib/admin/queries"
import type { Metadata } from "next"
import { ContributorMedalShowcase } from "@/components/shared/medal-showcase"
import { getContributorsRanking } from "@/lib/contributors/contributors-ranking"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: `Contributors`,
  description:
    "Meet students, teachers, and contributors sharing educational notes and study materials with the learning community.",
  alternates: {
    canonical: "/contributors",
  },
}

interface ContributorsPageProps {
  searchParams: Promise<ContributorSearchParams>
}

export default async function ContributorsPage({
  searchParams,
}: ContributorsPageProps) {
  const params = await searchParams
  const [stats, topContributors] = await Promise.all([
    getContributorStats(),
    getContributorsRanking(2),
  ])
  const hasAnyContributors = stats.totalContributors > 0

  return (
    <section className="space-y-6">
      {/* <div className="mb-6 space-y-2">
        <Heading>
          Meet the{" "}
          <Highlight animate={false} color="var(--primary)" variant="outline">
            Contributors
          </Highlight>
        </Heading>
        <SubHeading>
          Meet the students and learners helping make quality educational notes
          accessible to everyone
        </SubHeading>
      </div> */}

      {!hasAnyContributors ? (
        <div className="mx-auto">
          <ContributorsEmptyState variant="no-contributors" />
        </div>
      ) : (
        <>
          {topContributors.length > 0 && (
            <div className="mt-0">
              <Suspense fallback={<p>Loading...</p>}>
                <TopContributors contributors={topContributors} showOpenSpot />
              </Suspense>
            </div>
          )}

          <Suspense fallback={<AllContributorsSectionFallback />}>
            <AllContributorsSection
              searchParams={params}
              title="Contributor"
              highlight="Leaderboard"
              description="Top learners sharing their knowledge. Climb the ranks by sharing your notes."
            />
          </Suspense>
        </>
      )}

      <ContributorStatsSection stats={stats} />

      <ContributorMedalShowcase minimal />
    </section>
  )
}
