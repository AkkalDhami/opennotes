import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { APP_NAME } from "@/constants/app.constants"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Saved Collections",
  description: `Access collections you saved from other contributors on ${APP_NAME}.`,
}

export default function page() {
  return (
    <DashboardContainer>
      <PageHeader
        title="Saved Collections"
        description="Access collections you have saved from other contributors."
      />
    </DashboardContainer>
  )
}
