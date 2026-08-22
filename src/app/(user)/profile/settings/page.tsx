import { SettingsNav } from "@/components/settings/settings-nav"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { APP_NAME } from "@/constants/app.constants"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings",
  description: `Manage your ${APP_NAME} account, appearance, accessibility, and preferences.`,
}
export default function SettingsPage() {
  return (
    <DashboardContainer>
      <PageHeader
        title="Settings"
        description={`Customize your ${APP_NAME} experience and account preferences.`}
      />

      <SettingsNav />

      <AppearanceSettings />
    </DashboardContainer>
  )
}
