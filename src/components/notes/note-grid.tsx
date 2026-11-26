import { HugeiconsIcon } from "@hugeicons/react"
import { SearchRemoveIcon } from "@hugeicons/core-free-icons"
import { NoteCard } from "./note-card"
import { NoteList, NoteListItem } from "./note-list"
import { NoteGridPagination } from "./note-grid-pagination"
import { Button } from "@/components/ui/button"
import {
  buildNoteFiltersQuery,
  hasActiveFilters,
} from "@/lib/notes/note-filters"
import { NoteFilterState, NoteView, SearchNotesResult } from "@/types/note"
import Link from "next/link"
import { Route } from "next"

interface NoteGridProps {
  result: SearchNotesResult
  filters: NoteFilterState
  view: NoteView
}

export function NoteGrid({ result, filters, view }: NoteGridProps) {
  if (result.notes.length === 0) {
    return <NoteGridEmptyState filters={filters} />
  }

  return (
    <div className="space-y-6">
      {view === "list" ? (
        <NoteList>
          {result.notes.map((note) => (
            <NoteListItem key={note.id} note={note} />
          ))}
        </NoteList>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {result.notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
      <NoteGridPagination
        page={result.page}
        totalPages={result.totalPages}
        filters={filters}
      />
    </div>
  )
}

function NoteGridEmptyState({ filters }: { filters: NoteFilterState }) {
  const filtersActive = hasActiveFilters(filters)
  const clearFiltersHref = `/notes${buildNoteFiltersQuery({
    view: filters.view,
  })}` as Route

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon
          icon={SearchRemoveIcon}
          size={22}
          color="currentColor"
          strokeWidth={2}
          className="size-5 text-muted-foreground"
        />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">
        No notes found
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try changing your search or removing some filters.
      </p>
      {filtersActive && (
        <Button
          variant="outline"
          className="mt-4"
          nativeButton={false}
          render={<Link href={clearFiltersHref} />}
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}
