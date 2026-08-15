import { Suspense } from "react"
import { ContributorsSectionContent } from "@/components/contributors/contributors-section-content"
import { ContributorsSectionFallback } from "@/components/contributors/contributors-section-fallback"
import { Section } from "@/components/ui/section"
import { getTopContributors } from "@/lib/admin/queries"

async function ContributorsData() {
  const topContributors = await getTopContributors()

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
