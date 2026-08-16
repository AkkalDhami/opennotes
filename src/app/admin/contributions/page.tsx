import { requireAdmin } from "@/lib/auth/require-admin"
import {
  getAdminContributionStats,
  getAdminContributions,
} from "@/lib/notes/queries"
import { ContributionStats } from "@/components/admin/contributions/contribution-stats"
import { ContributionFilters } from "@/components/admin/contributions/contribution-filters"
import { ContributionsTable } from "@/components/admin/contributions/contributions-table"
import { ContributionsPagination } from "@/components/admin/contributions/contributions-pagination"
import { RefreshButton } from "@/components/admin/contributions/refresh-button"
import { contributionFiltersSchema } from "@/validations/contribution-filter"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export const metadata = {
  title: "Contributions | Admin",
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function AdminContributionsPage({
  searchParams,
}: PageProps) {
  // Server-side admin gate — redirects to /signin if not an authenticated ADMIN.
  await requireAdmin()

  const rawParams = await searchParams
  const filters = contributionFiltersSchema.parse({
    status: rawParams.status,
    search: rawParams.search,
    subject: rawParams.subject,
    category: rawParams.category,
    educationLevel: rawParams.educationLevel,
    dateFrom: rawParams.dateFrom,
    dateTo: rawParams.dateTo,
    page: rawParams.page,
  })

  const [stats, contributions] = await Promise.all([
    getAdminContributionStats(),
    getAdminContributions(filters),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <AdminPageHeader
          title="Contributions"
          description="Review and manage notes submitted by students and contributors."
        />

        <RefreshButton />
      </div>

      <ContributionStats stats={stats} />

      <ContributionFilters />

      <div className="flex flex-col gap-4">
        <ContributionsTable items={contributions.items} />
        <ContributionsPagination
          page={contributions.page}
          totalPages={contributions.totalPages}
          searchParams={rawParams}
        />
      </div>
    </div>
  )
}
