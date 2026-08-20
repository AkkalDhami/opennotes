import { AdminNotesSearch } from "@/components/admin/notes/admin-notes-search"
import { AdminNotesFilters } from "@/components/admin/notes/admin-notes-filters"
import { AdminNotesActiveFilters } from "@/components/admin/notes/admin-notes-active-filters"
import { AdminNotesFilters as AdminNotesFiltersType } from "@/types/note"

interface AdminNotesToolbarProps {
  filters: AdminNotesFiltersType
}

export function AdminNotesToolbar({ filters }: AdminNotesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminNotesSearch initialQuery={filters.q ?? ""} />
      </div>
      <AdminNotesFilters filters={filters} />
      <AdminNotesActiveFilters filters={filters} />
    </div>
  )
}
