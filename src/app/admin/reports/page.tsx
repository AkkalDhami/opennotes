import { RefreshButton } from "@/components/admin/contributions/refresh-button"
import { ReportsFilters } from "@/components/admin/reports/reports-filters"
import { ReportsHeader } from "@/components/admin/reports/reports-header"
import { ReportsStatsSection } from "@/components/admin/reports/reports-stats-section"
import { ReportsTableSection } from "@/components/admin/reports/reports-table-section"
import {
  ReportsStatsSkeleton,
  ReportsTableSkeleton,
} from "@/components/admin/reports/skeletons"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { requireAdmin } from "@/lib/auth/require-admin"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Reports",
  description: "View and manage user reports.",
}

type ReportStatusFilter = "OPEN" | "RESOLVED" | "DISMISSED"

type SearchParams = {
  status?: string
  search?: string
  page?: string
  sort?: string
}

export default async function AdminReportsPage(
  props: PageProps<"/admin/reports">
) {
  await requireAdmin()

  const { searchParams } = props

  const params = (await searchParams) as SearchParams
  const status = normalizeStatus(params.status)
  const search = params.search ?? ""
  const page = Number(params.page ?? "1") || 1
  const sort = params.sort === "oldest" ? "oldest" : "newest"

  return (
    <DashboardContainer>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <ReportsHeader />
        <RefreshButton />
      </div>

      <Suspense fallback={<ReportsStatsSkeleton />}>
        <ReportsStatsSection activeStatus={status} />
      </Suspense>

      <ReportsFilters activeStatus={status} search={search} />

      <Suspense
        key={`${status ?? "all"}-${search}-${page}-${sort}`}
        fallback={<ReportsTableSkeleton />}
      >
        <ReportsTableSection
          status={status}
          search={search}
          page={page}
          sort={sort}
        />
      </Suspense>
    </DashboardContainer>
  )
}

function normalizeStatus(value?: string): ReportStatusFilter | undefined {
  if (value === "OPEN" || value === "RESOLVED" || value === "DISMISSED")
    return value
  return undefined
}
