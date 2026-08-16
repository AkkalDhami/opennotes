import { ContributionForm } from "@/components/contributions/contribution-form"
import { ContributionGuidelines } from "@/components/contributions/contribution-guidelines";
import { Reveal } from "@/components/shared/reveal"
import { SectionHeader } from "@/components/shared/section-header"
import { Container } from "@/components/ui/container"

export default function page() {
  return (
    <Container className="space-y-6 border-x px-4 pt-4 pb-6">
      <div className="space-y-2">
        <Reveal>
          <SectionHeader
            headingId="share-notes"
            title="Share your notes"
            description="Help other students learn by sharing your study materials. Upload your
          notes and contribute to the community."
            viewAllHref="#"
          />
        </Reveal>
      </div>
      <ContributionGuidelines />
      <ContributionForm />
    </Container>
  )
}
