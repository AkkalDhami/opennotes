"use client"

import { useId, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  buildNoteFiltersQuery,
  getActiveFilterChips,
  hasActiveFilters,
  parseNoteFilters,
} from "@/lib/notes/note-filters"
import { SearchSelect, SelectOption } from "@/components/shared/search-select"
import { NoteFilterState } from "@/types/note"
import { Route } from "next"

export interface NoteFilterOptions {
  educationLevels: SelectOption[]
  grades: SelectOption[]
  subjects: SelectOption[]
  topics: SelectOption[]
  academicYears: SelectOption[]
  contributors: SelectOption[]
  tags: SelectOption[]
}

interface NoteFiltersProps {
  options: NoteFilterOptions
}

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  "plus-two": "+2",
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  other: "Other",
}

/** SearchSelect has no built-in label — this keeps every field consistently labeled. */
function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

export function NoteFilters({ options }: NoteFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const id = useId()

  const filters = parseNoteFilters(Object.fromEntries(searchParams.entries()))
  const chips = getActiveFilterChips(filters, {
    educationLevelLabels: EDUCATION_LEVEL_LABELS,
  })
  const filtersActive = hasActiveFilters(filters)

  function applyFilter(patch: Partial<NoteFilterState>) {
    const query = buildNoteFiltersQuery(filters, { ...patch, page: undefined })
    router.push(`${pathname}${query}` as Route, { scroll: false })
  }

  function handleSingleChange(
    field: keyof NoteFilterState
  ): (value: string | string[]) => void {
    return (value) => {
      const next = Array.isArray(value) ? value[0] : value
      applyFilter({ [field]: next || undefined } as Partial<NoteFilterState>)
    }
  }

  function handleTagsChange(value: string | string[]) {
    const next = Array.isArray(value) ? value : value ? [value] : []
    applyFilter({ tags: next.length > 0 ? next : undefined })
  }

  function removeChip(key: keyof NoteFilterState, value?: string) {
    if (key === "tags" && value) {
      applyFilter({ tags: (filters.tags ?? []).filter((t) => t !== value) })
      return
    }
    applyFilter({ [key]: undefined } as Partial<NoteFilterState>)
  }

  function clearAll() {
    router.push(pathname as Route, { scroll: false })
    setMobileOpen(false)
  }

  const fields = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <FilterField label="Educational Level" htmlFor="filter-education-level">
        <SearchSelect
          id="filter-education-level"
          placeholder="Any level"
          value={filters.educationLevel ?? ""}
          options={options.educationLevels}
          onChange={handleSingleChange("educationLevel")}
        />
      </FilterField>

      <FilterField label="Grade" htmlFor="filter-grade">
        <SearchSelect
          id="filter-grade"
          placeholder="Any grade"
          value={filters.grade ?? ""}
          options={options.grades}
          onChange={handleSingleChange("grade")}
        />
      </FilterField>

      <FilterField label="Subject" htmlFor="filter-subject">
        <SearchSelect
          id="filter-subject"
          placeholder="Any subject"
          value={filters.subject ?? ""}
          options={options.subjects}
          onChange={handleSingleChange("subject")}
        />
      </FilterField>

      <FilterField label="Topic" htmlFor="filter-topic">
        <SearchSelect
          id="filter-topic"
          placeholder="Any topic"
          value={filters.topic ?? ""}
          options={options.topics}
          onChange={handleSingleChange("topic")}
        />
      </FilterField>

      <FilterField label="Academic Year" htmlFor="filter-academic-year">
        <SearchSelect
          id="filter-academic-year"
          placeholder="Any year"
          value={filters.academicYear ?? ""}
          options={options.academicYears}
          onChange={handleSingleChange("academicYear")}
        />
      </FilterField>

      <FilterField label="Contributor" htmlFor="filter-contributor">
        <SearchSelect
          id="filter-contributor"
          placeholder="Any contributor"
          value={filters.contributor ?? ""}
          options={options.contributors}
          onChange={handleSingleChange("contributor")}
        />
      </FilterField>

      <FilterField label="Tags" htmlFor="filter-tags">
        <SearchSelect
          id="filter-tags"
          placeholder="Any tag"
          multiple
          value={filters.tags ?? []}
          options={options.tags}
          onChange={handleTagsChange}
        />
      </FilterField>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="hidden rounded-lg border bg-card p-4 lg:block">
        {fields}
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" className="gap-2">
                <HugeiconsIcon
                  icon={FilterIcon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="size-4"
                />
                Filters
                {filtersActive && (
                  <Badge variant="secondary" className="ml-1">
                    {chips.length}
                  </Badge>
                )}
              </Button>
            }
          />
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter notes</SheetTitle>
            </SheetHeader>
            <div className="py-4">{fields}</div>
            <SheetFooter className="flex-row gap-2">
              {filtersActive && (
                <Button variant="ghost" onClick={clearAll} className="flex-1">
                  Clear filters
                </Button>
              )}
              <Button onClick={() => setMobileOpen(false)} className="flex-1">
                Show results
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear filters
          </Button>
        )}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <Badge
              key={`${id}-${chip.key}-${chip.value ?? chip.label}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {chip.label}
              <button
                type="button"
                onClick={() => removeChip(chip.key, chip.value)}
                className="rounded-sm p-0.5 hover:bg-muted-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={12}
                  color="currentColor"
                  strokeWidth={2}
                  className="size-3"
                />
                <span className="sr-only">Remove {chip.label} filter</span>
              </button>
            </Badge>
          ))}
          <Button
            variant="link"
            size="sm"
            onClick={clearAll}
            className="hidden h-auto p-0 text-muted-foreground lg:inline-flex"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
