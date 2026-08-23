"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getSavedNotesSortOptions,
  SavedNotesSort,
} from "@/lib/user/saved-notes"
import { Route } from "next"

interface SavedNotesToolbarProps {
  defaultQuery: string
  defaultSort: SavedNotesSort
}

export function SavedNotesToolbar({
  defaultQuery,
  defaultSort,
}: SavedNotesToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [query, setQuery] = useState(defaultQuery)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(defaultQuery)
  }, [defaultQuery])

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }

      if ("q" in updates || "sort" in updates) {
        params.delete("page")
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}` as Route)
      })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    const trimmed = query.trim()
    const current = searchParams.get("q") ?? ""

    if (trimmed === current) return

    const timeout = setTimeout(() => {
      updateParams({ q: trimmed || undefined })
    }, 300)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <label htmlFor="saved-notes-search" className="sr-only">
          Search saved notes
        </label>
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            color="currentColor"
            strokeWidth={2}
          />
        </span>
        <Input
          id="saved-notes-search"
          type="search"
          placeholder="Search saved notes..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-9"
        />
      </div>

      <div className="w-full sm:w-56">
        <label htmlFor="saved-notes-sort" className="sr-only">
          Sort saved notes
        </label>
        <Select
          value={defaultSort}
          onValueChange={(value) => updateParams({ sort: value ?? undefined })}
        >
          <SelectTrigger id="saved-notes-sort" aria-label="Sort saved notes">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getSavedNotesSortOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
