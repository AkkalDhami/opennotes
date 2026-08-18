import { Suspense } from "react"
import { Metadata } from "next"
import { NoteSearch } from "@/components/notes/note-search"
import { NoteFilters, NoteFilterOptions } from "@/components/notes/note-filters"
import { NoteSort } from "@/components/notes/note-sort"
import { NoteGrid } from "@/components/notes/note-grid"
import { NoteCardSkeletonGrid } from "@/components/notes/note-card-skeleton"
import { searchNotes } from "@/lib/notes/search-notes"
import { getNoteFilterOptions } from "@/lib/notes/get-filter-options"
import { parseNoteFilters, resolveDefaultSort } from "@/lib/notes/note-filters"
import { DEFAULT_PAGE_SIZE } from "@/types/note"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"

export const metadata: Metadata = {
  title: "Browse Educational Notes",
  description:
    "Browse educational notes, study materials, class notes, and PDF resources by subject, grade, course, topic, and academic level.",
  alternates: {
    canonical: "/notes",
  },
}
interface NotesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function NotesDiscoveryPage({
  searchParams,
}: NotesPageProps) {
  const resolvedSearchParams = await searchParams
  const filters = parseNoteFilters(resolvedSearchParams)
  const sort = resolveDefaultSort(filters)

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Heading>Discover Notes</Heading>
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
          fallback={<NoteResultsSkeleton />}
        >
          <NoteResults filters={{ ...filters, sort }} />
        </Suspense>
      </div>
    </div>
  )
}

async function NoteFiltersSection() {
  const options: NoteFilterOptions = await getNoteFilterOptions()
  return <NoteFilters options={options} />
}

function NoteResultsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <NoteSort />
      </div>
      <NoteCardSkeletonGrid />
    </div>
  )
}

async function NoteResults({
  filters,
}: {
  filters: Parameters<typeof searchNotes>[0]
}) {
  const result = await searchNotes({ ...filters, pageSize: DEFAULT_PAGE_SIZE })
  return (
    <div className="space-y-4">
      <div className="flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          {result.total.toLocaleString()} note{result.total === 1 ? "" : "s"}{" "}
          found
        </p>
        <NoteSort />
      </div>
      <NoteGrid result={result} filters={filters} />
    </div>
  )
}
