import { Suspense } from "react"
import { Metadata } from "next"
import { NoteSearch } from "@/components/notes/note-search"
import { NoteFilters, NoteFilterOptions } from "@/components/notes/note-filters"
import { NoteSort } from "@/components/notes/note-sort"
import { NoteGrid } from "@/components/notes/note-grid"
import {
  NoteCardSkeletonGrid,
  NoteListSkeleton,
} from "@/components/notes/note-card-skeleton"
import { CollectionViewSwitcher } from "@/components/user/collections/collection-view-switcher"
import { searchNotes } from "@/lib/search"
import { getNoteFilterOptions } from "@/lib/notes/get-filter-options"
import { parseNoteFilters, resolveDefaultSort } from "@/lib/notes/note-filters"
import { DEFAULT_PAGE_SIZE, NoteView } from "@/types/note"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"
import { ContributorMedalShowcase } from "@/components/shared/medal-showcase"
import { Highlight } from "@/components/ui/highlight"

export const metadata: Metadata = {
  title: "Browse Educational Notes",
  description:
    "Browse educational notes, study materials, class notes, and PDF resources by subject, grade, course, topic, and academic level.",
  alternates: {
    canonical: "/notes",
  },
}
export interface NotesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function NotesDiscoveryPage({
  searchParams,
}: NotesPageProps) {
  const resolvedSearchParams = await searchParams
  const filters = parseNoteFilters(resolvedSearchParams)
  const sort = resolveDefaultSort(filters)
  const view = filters.view ?? "grid"

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Heading>
          Discover{" "}
          <Highlight animate={false} color="var(--primary)" variant="outline">
            Notes
          </Highlight>
        </Heading>
        <SubHeading>
          Find study notes, lecture materials, summaries, and resources shared
          by students and educators.
        </SubHeading>
      </header>

      <div className="">
        <NoteSearch />
      </div>

      <div className="">
        <Suspense fallback={null}>
          <NoteFiltersSection />
        </Suspense>
      </div>

      <div className="">
        <Suspense
          key={JSON.stringify(resolvedSearchParams)}
          fallback={<NoteResultsSkeleton view={view} />}
        >
          <NoteResults filters={{ ...filters, sort }} view={view} />
        </Suspense>
      </div>

      <ContributorMedalShowcase minimal className="mt-4" />
    </div>
  )
}

async function NoteFiltersSection() {
  const options: NoteFilterOptions = await getNoteFilterOptions()
  return <NoteFilters options={options} />
}

function NoteResultsActions({ view }: { view: NoteView }) {
  return (
    <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
      <NoteSort />
      <CollectionViewSwitcher
        value={view}
        label="Note layout"
        className="shrink-0"
      />
    </div>
  )
}

function NoteResultsSkeleton({ view }: { view: NoteView }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <NoteResultsActions view={view} />
      </div>
      {view === "list" ? <NoteListSkeleton /> : <NoteCardSkeletonGrid />}
    </div>
  )
}

async function NoteResults({
  filters,
  view,
}: {
  filters: Parameters<typeof searchNotes>[0]
  view: NoteView
}) {
  const result = await searchNotes({ ...filters, pageSize: DEFAULT_PAGE_SIZE })
  return (
    <div className="space-y-4">
      <div className="flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          {result.total.toLocaleString()} note{result.total === 1 ? "" : "s"}{" "}
          found
        </p>
        <NoteResultsActions view={view} />
      </div>
      <NoteGrid result={result} filters={filters} view={view} />
    </div>
  )
}
