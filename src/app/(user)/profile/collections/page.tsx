import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { APP_NAME } from "@/constants/app.constants"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Collections",
  description: `Create, organize, and manage your notes with collections on ${APP_NAME}.`,
}

export default function page() {
  return (
    <DashboardContainer>
      <PageHeader
        title="My Collections"
        description="Create and organize your notes into collections."
      />
    </DashboardContainer>
  )
}
