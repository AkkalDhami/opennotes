import {
  ContributionFilters,
  FilterOption,
} from "@/components/contributions/contribution-filters"
import { ContributionTable } from "@/components/contributions/contribution-table"
import { ContributionCardList } from "@/components/contributions/contribution-card"
import { ContributionEmptyState } from "@/components/contributions/contribution-empty-state"
import { ContributionPagination } from "@/components/contributions/contribution-pagination"
import { ContributionListResult } from "@/types/contribution"
import { Heading } from "../ui/heading";
import { SubHeading } from "../ui/sub-heading";

interface ProfileContributionsProps {
  result: ContributionListResult
  hasActiveFilters: boolean
  filterOptions: {
    subjectOptions: FilterOption[]
    levelOptions: FilterOption[]
    courseOptions: FilterOption[]
  }
}

export function ProfileContributions({
  result,
  hasActiveFilters,
  filterOptions,
}: ProfileContributionsProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Heading>
          My Contributions
        </Heading>
        <SubHeading>
          Manage and track the notes you&apos;ve shared with the OpenNotes
          community.
        </SubHeading>
      </div>

      <ContributionFilters {...filterOptions} />

      {result.items.length === 0 ? (
        <ContributionEmptyState
          variant={hasActiveFilters ? "no-results" : "no-contributions"}
        />
      ) : (
        <>
          <ContributionTable contributions={result.items} />
          <ContributionCardList contributions={result.items} />
          <ContributionPagination
            page={result.page}
            totalPages={result.totalPages}
          />
        </>
      )}
    </section>
  )
}
