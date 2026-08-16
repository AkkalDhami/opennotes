import { TrendingNotesSection } from "@/components/landing/trending-notes"
import { HeroSection } from "@/components/landing/hero-section"
import { Container } from "@/components/ui/container"
import { ContributorsSection } from "@/components/landing/contributors-section"
import { ContributorMedalShowcase } from "@/components/shared/medal-showcase"

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
