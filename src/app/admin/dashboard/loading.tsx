import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header"
import {
  ListCardSkeleton,
  ModerationSkeleton,
  StatsGridSkeleton,
  TableCardSkeleton,
} from "@/components/admin/dashboard/skeletons"

export default function AdminDashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader />
      <StatsGridSkeleton />
      <ModerationSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        <ListCardSkeleton rows={5} />
        <TableCardSkeleton rows={5} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ListCardSkeleton rows={5} />
        <ListCardSkeleton rows={3} />
      </div>
    </div>
  )
}
