import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { APP_NAME } from "@/constants/app.constants"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contributions",
  description: `Track your shared notes and see the impact of your contributions on ${APP_NAME}.`,
}

export default function page() {
  return (
    <DashboardContainer>
      <PageHeader
        title="Contributions"
        description="Track your contributions and see how your notes help others."
      />
    </DashboardContainer>
  )
}
