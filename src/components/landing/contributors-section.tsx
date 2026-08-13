import { Suspense } from "react"
import { ContributorsSectionContent } from "@/components/contributors/contributors-section-content"
import { ContributorsSectionFallback } from "@/components/contributors/contributors-section-fallback"
import { getFeaturedContributors } from "@/data/get-contributors"
import { Section } from "@/components/ui/section"

async function ContributorsData() {
  const contributors = await getFeaturedContributors(4)
  return <ContributorsSectionContent contributors={contributors} />
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
