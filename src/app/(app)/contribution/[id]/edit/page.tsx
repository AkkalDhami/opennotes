import { ContributionForm } from "@/components/contributions/contribution-form"
import { Reveal } from "@/components/shared/reveal"
import { SectionHeader } from "@/components/shared/section-header"
import { Container } from "@/components/ui/container"
import { APP_NAME } from "@/constants/app.constants"

export default function page() {
  return (
    <Container className="space-y-6 border-x px-4 pt-4 pb-6">
      <div className="space-y-2">
        <Reveal>
          <SectionHeader
            headingId="edit-notes"
            title="Edit your notes"
            description={`Edit the notes you shared with the ${APP_NAME} community.`}
            viewAllHref="#"
          />
        </Reveal>
      </div>
      <ContributionForm />
    </Container>
  )
}
