import { Suspense } from "react"

import { ReportDetail } from "@/components/admin/reports/report-detail"
import { ReportDetailSkeleton } from "@/components/admin/reports/report-detail-skeleton"
import { requireAdmin } from "@/lib/auth/require-admin"
import { DashboardContainer } from "@/components/ui/dashboard-container"

export const metadata = {
  title: "Report details",
}

export default async function AdminReportDetailPage(
  props: PageProps<"/admin/reports/[id]">
) {
  await requireAdmin()

  const { params } = props
  const { id } = await params

  return (
    <DashboardContainer>
      <Suspense fallback={<ReportDetailSkeleton />}>
        <ReportDetail reportId={id} />
      </Suspense>
    </DashboardContainer>
  )
}
