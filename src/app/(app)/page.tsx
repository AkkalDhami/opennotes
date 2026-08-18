import { TrendingNotesSection } from "@/components/landing/trending-notes"
import { HeroSection } from "@/components/landing/hero-section"
import { Container } from "@/components/ui/container"
import { ContributorsSection } from "@/components/landing/contributors-section"
import { ContributorMedalShowcase } from "@/components/shared/medal-showcase"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Find and Share Educational Notes",
  description:
    "Find, read, download, and share educational notes and study materials for school, college, and university students.",
  alternates: {
    canonical: "/",
  },
}
export default function Page() {
  return (
    <Container className="border-edge space-y-2 border-x pb-6">
      <HeroSection />
      <TrendingNotesSection />
      <ContributorsSection />
      <ContributorMedalShowcase className="mt-4" />
    </Container>
  )
}
