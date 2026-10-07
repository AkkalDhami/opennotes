import {
  ContributionFilters,
  FilterOption,
} from "@/components/contributions/contribution-filters"
import { ContributionTable } from "@/components/contributions/contribution-table"
import { ContributionCardList } from "@/components/contributions/contribution-card"
import { ContributionEmptyState } from "@/components/contributions/contribution-empty-state"
import { ContributionPagination } from "@/components/contributions/contribution-pagination"
import { NotesViewSwitcher } from "@/components/profile/notes-view-switcher"
import { ContributionListResult } from "@/types/contribution"
import { NotesView } from "@/lib/user/parse-contribution-filters"

interface ProfileContributionsProps {
  result: ContributionListResult
  hasActiveFilters: boolean
  view: NotesView
  filterOptions: {
    subjectOptions: FilterOption[]
    levelOptions: FilterOption[]
    courseOptions: FilterOption[]
  }
}

export function ProfileContributions({
  result,
  hasActiveFilters,
  view,
  filterOptions,
}: ProfileContributionsProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {result.totalCount} {result.totalCount === 1 ? "note" : "notes"}
        </p>
        <NotesViewSwitcher value={view} />
      </div>

      <ContributionFilters {...filterOptions} />

      {result.items.length === 0 ? (
        <ContributionEmptyState
          variant={hasActiveFilters ? "no-results" : "no-contributions"}
        />
      ) : (
        <>
          {view === "table" ? (
            <ContributionTable contributions={result.items} />
          ) : (
            <ContributionCardList contributions={result.items} layout="grid" />
          )}
          <ContributionPagination
            page={result.page}
            totalPages={result.totalPages}
          />
        </>
      )}
    </section>
  )
}
