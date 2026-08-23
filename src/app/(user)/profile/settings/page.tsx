import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { SettingsTabs } from "@/components/settings/settings-tabs"
import { APP_NAME } from "@/constants/app.constants"
import { getUserSessions } from "@/features/auth/auth.service"
import { getAuthenticatedSession } from "@/lib/auth/current-session"
import { PublicSessionType } from "@/types/session"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings",
  description: `Manage your ${APP_NAME} account, appearance, accessibility, and preferences.`,
}
export default async function SettingsPage() {
  const auth = await getAuthenticatedSession()
  const sessions: PublicSessionType[] = auth
    ? await getUserSessions(auth.userId, auth.sessionId)
    : []

  return (
    <DashboardContainer>
      <PageHeader
        title="Settings"
        description={`Customize your ${APP_NAME} experience and account preferences.`}
      />

      <SettingsTabs sessions={sessions} />
    </DashboardContainer>
  )
}
