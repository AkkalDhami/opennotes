"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  buildNoteFiltersQuery,
  parseNoteFilters,
  resolveDefaultSort,
} from "@/lib/notes/note-filters"
import { NOTE_SORT_OPTIONS, NoteSortOption } from "@/types/note"
import { Route } from "next"

export function NoteSort() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = parseNoteFilters(Object.fromEntries(searchParams.entries()))
  const activeSort = resolveDefaultSort(filters)

  function handleChange(next: NoteSortOption | null) {
    if (next === null) return

    const query = buildNoteFiltersQuery(filters, {
      sort: next,
      page: undefined,
    })
    router.push(`${pathname}${query}` as Route, { scroll: false })
  }

  return (
    <Select value={activeSort} onValueChange={handleChange}>
      <SelectTrigger aria-label="Sort notes" className="w-full sm:w-52">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {NOTE_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
