import { ContentHealthSection } from "@/components/admin/dashboard/content-health-section"
import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header"
import { ModerationSection } from "@/components/admin/dashboard/moderation-section"
import { QuickActions } from "@/components/admin/dashboard/quick-actions"
import { RecentActivitySection } from "@/components/admin/dashboard/recent-activity-section"
import { RecentContributorsSection } from "@/components/admin/dashboard/recent-contributors-section"
import { RecentNotesSection } from "@/components/admin/dashboard/recent-notes-section"
import {
  ListCardSkeleton,
  ModerationSkeleton,
  StatsGridSkeleton,
  TableCardSkeleton,
} from "@/components/admin/dashboard/skeletons"
import { StatsSection } from "@/components/admin/dashboard/stats-section"
import { TopContributorsSection } from "@/components/admin/dashboard/top-contributors-section"
import { requireAdmin } from "@/lib/auth/require-admin"
import { Suspense } from "react"

export default async function Page() {
  await requireAdmin()

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />

      <Suspense fallback={<StatsGridSkeleton />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<ModerationSkeleton />}>
        <ModerationSection />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<ListCardSkeleton rows={5} />}>
          <RecentActivitySection />
        </Suspense>
        <Suspense fallback={<TableCardSkeleton rows={5} />}>
          <RecentNotesSection />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<ListCardSkeleton rows={5} />}>
          <RecentContributorsSection />
        </Suspense>
        <Suspense fallback={<ListCardSkeleton rows={3} />}>
          <TopContributorsSection />
        </Suspense>
      </div>

      <QuickActions />

      <Suspense fallback={<TableCardSkeleton rows={1} />}>
        <ContentHealthSection />
      </Suspense>
    </div>
  )
}
