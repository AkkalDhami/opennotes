import { ReportsHeader } from "@/components/admin/reports/reports-header"
import {
  ReportsStatsSkeleton,
  ReportsTableSkeleton,
} from "@/components/admin/reports/skeletons"

export default function AdminReportsLoading() {
  return (
    <div className="space-y-4">
      <ReportsHeader />
      <ReportsStatsSkeleton />
      <ReportsTableSkeleton />
    </div>
  )
}
