import { TrendingNotes } from "@/components/landing/trending-notes";
import { HeroSection } from "@/components/landing/hero-section";
import { Container } from "@/components/ui/container";
import { ContributorsSection } from "@/components/landing/contributors-section";

export default function Page() {
  return (
    <Container className="border-edge space-y-2 border-x">
      <HeroSection />
      <TrendingNotes />
      <ContributorsSection />
    </Container>
  )
}
