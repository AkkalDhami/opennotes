import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { APP_NAME } from "@/constants/app.constants"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Notes",
  description: `View and manage the notes you have shared on ${APP_NAME}.`,
}

export default function page() {
  return (
    <DashboardContainer>
      <PageHeader
        title="My Notes"
        description="View and manage the notes you have shared."
      />
    </DashboardContainer>
  )
}
