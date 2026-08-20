"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  NOTE_STATUS_DISPLAY,
  SOURCE_TYPE_DISPLAY,
} from "@/configs/note-display"
import { buildNotesUrl, clearAllFiltersUrl } from "@/utils/notes-url"
import { AdminNotesFilters } from "@/types/note"
import { Route } from "next"

interface Chip {
  key: string
  label: string
}

export function AdminNotesActiveFilters({
  filters,
}: {
  filters: AdminNotesFilters
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const chips: Chip[] = []
  if (filters.status)
    chips.push({
      key: "status",
      label: `Status: ${NOTE_STATUS_DISPLAY[filters.status].label}`,
    })
  if (filters.subject)
    chips.push({ key: "subject", label: `Subject: ${filters.subject}` })
  if (filters.educationLevel)
    chips.push({
      key: "educationLevel",
      label: `Level: ${filters.educationLevel}`,
    })
  if (filters.sourceType)
    chips.push({
      key: "sourceType",
      label: `Source: ${SOURCE_TYPE_DISPLAY[filters.sourceType].label}`,
    })
  if (filters.processingStatus)
    chips.push({
      key: "processingStatus",
      label: `Processing: ${filters.processingStatus}`,
    })
  if (filters.q) chips.push({ key: "q", label: `"${filters.q}"` })

  if (chips.length === 0) return null

  function removeChip(key: string) {
    router.push(
      buildNotesUrl({
        current: searchParams,
        updates: { [key]: null },
      }) as Route
    )
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Active filters"
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => removeChip(chip.key)}
          className="flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          {chip.label}
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={12}
            color="currentColor"
            strokeWidth={2}
            className="size-3"
          />
          <span className="sr-only">Remove filter: {chip.label}</span>
        </button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-muted-foreground"
        onClick={() => router.push(clearAllFiltersUrl() as Route)}
      >
        Clear filters
      </Button>
    </div>
  )
}
