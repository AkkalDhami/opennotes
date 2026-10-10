import { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { FileUploadIcon } from "@hugeicons/core-free-icons"

import { DashboardStats } from "@/components/profile/dashboard-stats"
import { DashboardQuickActions } from "@/components/profile/dashboard-quick-actions"
import { DashboardRecentNotes } from "@/components/profile/dashboard-recent-notes"
import { DashboardSavedNotes } from "@/components/profile/dashboard-saved-notes"
import { ContributionErrorState } from "@/components/contributions/contribution-error-state"
import { getUserDashboard } from "@/lib/user/get-dashboard"
import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { Button } from "@/components/ui/button"
import { getGreeting } from "@/utils/greeting"
import { APP_NAME } from "@/constants/app.constants"

export const metadata: Metadata = {
  title: "Overview",
  description: `See your notes, downloads, views, and saved activity on ${APP_NAME}.`,
}

export default async function ProfileDashboardPage() {
  let dashboard
  let loadError = false

  try {
    dashboard = await getUserDashboard()
  } catch {
    loadError = true
    dashboard = null
  }

  if (!loadError && !dashboard) {
    redirect("/signin")
  }

  const greeting = dashboard
    ? getGreeting(dashboard.profile.name)
    : "Welcome back"

  return (
    <DashboardContainer>
      <PageHeader
        title={greeting}
        description="See your activity, saved notes, and contributions at a glance."
      >
        <Button
          nativeButton={false}
          className="gap-2"
          render={
            <Link href="/contribution">
              <HugeiconsIcon
                icon={FileUploadIcon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
              Share notes
            </Link>
          }
        />
      </PageHeader>

      {loadError || !dashboard ? (
        <ContributionErrorState />
      ) : (
        <>
          <DashboardStats stats={dashboard.stats} />
          <DashboardQuickActions />
          <DashboardRecentNotes notes={dashboard.recentNotes} />
          <DashboardSavedNotes
            notes={dashboard.savedNotes}
            total={dashboard.stats.savedNotes}
          />
        </>
      )}
    </DashboardContainer>
  )
}
