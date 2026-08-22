import type { Metadata } from "next"
import { Suspense } from "react"
import { adminNotesFiltersSchema } from "@/validations/admin-notes"
import { AdminNotesStats } from "@/components/admin/notes/admin-notes-stats"
import { AdminNotesToolbar } from "@/components/admin/notes/admin-notes-toolbar"
import { AdminNotesTable } from "@/components/admin/notes/admin-notes-table"
import { AdminNotesPagination } from "@/components/admin/notes/admin-notes-pagination"
import { AdminNotesSkeleton } from "@/components/admin/notes/admin-notes-skeleton"
import { getAdminNotes, getAdminNoteStats } from "@/lib/admin/admin-notes"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"
import { DashboardContainer } from "@/components/ui/dashboard-container"

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Manage, review, and moderate educational notes shared by contributors.",
}

interface AdminNotesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminNotesPage({
  searchParams,
}: AdminNotesPageProps) {
  const rawParams = await searchParams
  const flatParams = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  )

  const filters = adminNotesFiltersSchema.parse(flatParams)

  return (
    <DashboardContainer>
      <div className="space-y-2">
        <Heading>Notes</Heading>
        <SubHeading>
          Manage, review, and moderate educational notes shared by contributors.
        </SubHeading>
      </div>

      <Suspense fallback={<AdminNotesStatsSkeleton />}>
        <AdminNotesStatsSection />
      </Suspense>

      <AdminNotesToolbar filters={filters} />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<AdminNotesSkeleton pageSize={filters.pageSize} />}
      >
        <AdminNotesResults filters={filters} />
      </Suspense>
    </DashboardContainer>
  )
}

async function AdminNotesStatsSection() {
  const stats = await getAdminNoteStats()
  return <AdminNotesStats stats={stats} />
}

function AdminNotesStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-lg border border-border bg-muted/40"
        />
      ))}
    </div>
  )
}

async function AdminNotesResults({
  filters,
}: {
  filters: ReturnType<typeof adminNotesFiltersSchema.parse>
}) {
  const result = await getAdminNotes(filters)

  return (
    <>
      <AdminNotesTable
        notes={result.items}
        hasActiveFilters={Boolean(
          filters.q ||
          filters.status ||
          filters.subject ||
          filters.educationLevel ||
          filters.sourceType ||
          filters.processingStatus
        )}
      />
      <AdminNotesPagination pagination={result.pagination} />
    </>
  )
}
