import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { APP_NAME } from "@/constants/app.constants"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Saved Notes",
  description: `Find the notes you saved on ${APP_NAME} to read or study later.`,
}

export default function page() {
  return (
    <DashboardContainer>
      <PageHeader
        title="Saved Notes"
        description="Find the notes you bookmarked to read or study later."
      />
    </DashboardContainer>
  )
}
