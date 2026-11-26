import { TrendingNotesSection } from "@/components/landing/trending-notes"
import { HeroSection } from "@/components/landing/hero-section"
import { Container } from "@/components/ui/container"
import { ContributorsSection } from "@/components/landing/contributors-section"
import { ContributorMedalShowcase } from "@/components/shared/medal-showcase"
import { Metadata } from "next"
import { CollectionsSectionContainer } from "@/components/landing/collection-section-container"
import {
  AllContributorsSection,
  AllContributorsSectionFallback,
  type ContributorSearchParams,
} from "@/components/contributors/all-contributors-section"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Find and Share Educational Notes",
  description:
    "Find, read, download, and share educational notes and study materials for school, college, and university students.",
  alternates: {
    canonical: "/",
  },
}

interface HomePageProps {
  searchParams: Promise<ContributorSearchParams>
}

export default async function Page({ searchParams }: HomePageProps) {
  const params = await searchParams

  return (
    <Container className="space-y-2 pb-6">
      <HeroSection />
      <TrendingNotesSection view="list" />
      <CollectionsSectionContainer view="list" />
      <ContributorsSection />
      <ContributorMedalShowcase className="mx-4 mt-4" minimal align="start" />
      <Suspense fallback={<AllContributorsSectionFallback />}>
        <AllContributorsSection
          searchParams={params}
          basePath="/"
          className="mx-4"
        />
      </Suspense>
    </Container>
  )
}
