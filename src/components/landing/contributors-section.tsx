import { Suspense } from "react"
import { ContributorsSectionContent } from "@/components/contributors/contributors-section-content"
import { ContributorsSectionFallback } from "@/components/contributors/contributors-section-fallback"
import { Section } from "@/components/ui/section"
import { getContributorsRanking } from "@/lib/contributors/contributors-ranking"

async function ContributorsData() {
  const topContributors = await getContributorsRanking(12)

  return <ContributorsSectionContent contributors={topContributors} home />
}

export function ContributorsSection() {
  return (
    <Section aria-labelledby="contributors-heading">
      <Suspense fallback={<ContributorsSectionFallback />}>
        <ContributorsData />
      </Suspense>
    </Section>
  )
}
