import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { SettingsTabs } from "@/components/settings/settings-tabs"
import { APP_NAME } from "@/constants/app.constants"
import { Metadata } from "next"
import { getUserPublicSessions, MAX_SESSIONS } from "@/lib/auth/session-queries"
import { getCurrentSessionId } from "@/features/auth/auth.cookie"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Settings",
  description: `Manage your ${APP_NAME} account, appearance, accessibility, and preferences.`,
}
export default async function SettingsPage() {
  return (
    <DashboardContainer>
      <PageHeader
        title="Settings"
        description={`Customize your ${APP_NAME} experience and account preferences.`}
      />

      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        }
      >
        <SettingsTabsLoader />
      </Suspense>
    </DashboardContainer>
  )
}

async function SettingsTabsLoader() {
  const [sessions, currentSessionId] = await Promise.all([
    getUserPublicSessions(),
    getCurrentSessionId(),
  ])

  return (
    <SettingsTabs
      initialSessions={sessions}
      currentSessionId={currentSessionId}
      maxSessions={MAX_SESSIONS}
    />
  )
}
