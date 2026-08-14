import { ContributionForm } from "@/components/contributions/contribution-form"
import { Reveal } from "@/components/shared/reveal"
import { SectionHeader } from "@/components/shared/section-header"
import { Container } from "@/components/ui/container"

export default function page() {
  return (
    <Container className="space-y-2 border-x px-4 pt-4 pb-6">
      <div className="mb-6 space-y-3">
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
      <ContributionForm />
    </Container>
  )
}
