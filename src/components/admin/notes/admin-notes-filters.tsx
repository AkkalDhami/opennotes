"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar04Icon, FilterIcon } from "@hugeicons/core-free-icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  SORT_OPTIONS,
  AdminNotesFilters as AdminNotesFiltersType,
} from "@/types/note"
import { buildNotesUrl } from "@/utils/notes-url"
import { Route } from "next"
import { NOTE_STATUSES } from "@/validations/note"
import {
  NOTE_STATUS_DISPLAY,
  PROCESSING_STATUS_DISPLAY,
  SORT_OPTION_LABELS,
  SOURCE_TYPE_DISPLAY,
} from "@/configs/note-display"
import { NOTE_PROCESSING_STATUSES, NOTE_SOURCES } from "@/db"

// In production these come from a distinct-values query; kept static here for scope.
const SUBJECT_OPTIONS = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "Computer Science",
  "English",
  "Economics",
]
const EDUCATION_LEVEL_OPTIONS = [
  "School",
  "Higher Secondary",
  "Bachelor",
  "Masters",
]

interface AdminNotesFiltersProps {
  filters: AdminNotesFiltersType
}

export function AdminNotesFilters({ filters }: AdminNotesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setParam(key: string, value: string | null) {
    router.push(
      buildNotesUrl({
        current: searchParams,
        updates: { [key]: value },
      }) as Route
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.status ?? "ALL"}
        onValueChange={(v) => setParam("status", v === "ALL" ? null : v)}
      >
        <SelectTrigger className="h-9 w-37.5" aria-label="Filter by status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {NOTE_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {NOTE_STATUS_DISPLAY[status].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.subject ?? "ALL"}
        onValueChange={(v) => setParam("subject", v === "ALL" ? null : v)}
      >
        <SelectTrigger className="h-9 w-35" aria-label="Filter by subject">
          <SelectValue placeholder="Subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All subjects</SelectItem>
          {SUBJECT_OPTIONS.map((subject) => (
            <SelectItem key={subject} value={subject}>
              {subject}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.educationLevel ?? "ALL"}
        onValueChange={(v) =>
          setParam("educationLevel", v === "ALL" ? null : v)
        }
      >
        <SelectTrigger
          className="h-9 w-40"
          aria-label="Filter by education level"
        >
          <SelectValue placeholder="Education level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All levels</SelectItem>
          {EDUCATION_LEVEL_OPTIONS.map((level) => (
            <SelectItem key={level} value={level}>
              {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sourceType ?? "ALL"}
        onValueChange={(v) => setParam("sourceType", v === "ALL" ? null : v)}
      >
        <SelectTrigger className="h-9 w-37.5" aria-label="Filter by source">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All sources</SelectItem>
          {NOTE_SOURCES.map((source) => (
            <SelectItem key={source} value={source}>
              {SOURCE_TYPE_DISPLAY[source].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.processingStatus ?? "ALL"}
        onValueChange={(v) =>
          setParam("processingStatus", v === "ALL" ? null : v)
        }
      >
        <SelectTrigger
          className="h-9 w-37.5"
          aria-label="Filter by processing status"
        >
          <SelectValue placeholder="Processing" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All processing</SelectItem>
          {NOTE_PROCESSING_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {PROCESSING_STATUS_DISPLAY[status].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <HugeiconsIcon
                icon={Calendar04Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
              Date
            </Button>
          }
        />
        <PopoverContent className="w-64 space-y-3" align="start">
          <div className="space-y-1.5">
            <Label htmlFor="date-from">From</Label>
            <input
              id="date-from"
              type="date"
              defaultValue={searchParams.get("dateFrom") ?? ""}
              onChange={(e) => setParam("dateFrom", e.target.value || null)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date-to">To</Label>
            <input
              id="date-to"
              type="date"
              defaultValue={searchParams.get("dateTo") ?? ""}
              onChange={(e) => setParam("dateTo", e.target.value || null)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            />
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-2">
        <Label htmlFor="sort-select" className="sr-only">
          Sort notes
        </Label>
        <Select value={filters.sort} onValueChange={(v) => setParam("sort", v)}>
          <SelectTrigger
            id="sort-select"
            className="h-9 w-42.5"
            aria-label="Sort notes"
          >
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {SORT_OPTION_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export { FilterIcon as AdminFilterIcon }
