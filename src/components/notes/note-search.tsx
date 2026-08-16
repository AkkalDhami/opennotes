"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import {
  buildNoteFiltersQuery,
  parseNoteFilters,
} from "@/lib/notes/note-filters"
import { Route } from "next"

const DEBOUNCE_MS = 350

export function NoteSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentFilters = parseNoteFilters(
    Object.fromEntries(searchParams.entries())
  )

  const [value, setValue] = useState(currentFilters.q ?? "")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the input in sync if the URL changes from elsewhere (e.g. a tag
  // link, browser back/forward, or "Clear filters").
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(currentFilters.q ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")])

  function updateUrl(nextQuery: string) {
    const query = buildNoteFiltersQuery(currentFilters, {
      q: nextQuery || undefined,
      page: undefined, // a new search resets pagination
    })
    router.push(`${pathname}${query}` as Route, { scroll: false })
  }

  function handleChange(next: string) {
    setValue(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateUrl(next), DEBOUNCE_MS)
  }

  function handleClear() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setValue("")
    updateUrl("")
  }

  return (
    <div className="relative w-full">
      <HugeiconsIcon
        icon={Search01Icon}
        size={16}
        color="currentColor"
        strokeWidth={2}
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="text"
        inputMode="search"
        autoFocus
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (debounceRef.current) clearTimeout(debounceRef.current)
            updateUrl(value)
          }
        }}
        placeholder="Search by title, subject, topic, tags, contributor..."
        aria-label="Search notes"
        className="pr-9 pl-9"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
            className="size-4"
          />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </div>
  )
}
