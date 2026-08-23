"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, FilterIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SearchSelect } from "@/components/shared/search-select"
import { Route } from "next"
import { NOTE_STATUSES } from "@/validations/note"
import { STATUS_CONFIG } from "@/types/contribution"

export interface FilterOption {
  label: string
  value: string
  /** Present on course options so the list can be scoped to the selected education level. */
  levelId?: string
}

interface ContributionFiltersProps {
  subjectOptions: FilterOption[]
  levelOptions: FilterOption[]
  courseOptions: FilterOption[]
}

const SORT_LABELS: Record<string, string> = {
  newest: "Newest",
  oldest: "Oldest",
  most_downloaded: "Most Downloaded",
}

function FilterFields({
  subjectOptions,
  levelOptions,
  courseOptions,
}: ContributionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  )

  const status = searchParams.get("status") ?? "ALL"
  const subject = searchParams.get("subject") ?? ""
  const level = searchParams.get("level") ?? ""
  const course = searchParams.get("course") ?? ""
  const sort = searchParams.get("sort") ?? "newest"

  const filteredCourseOptions = useMemo(() => {
    if (!level) return courseOptions
    return courseOptions.filter((option) => option.levelId === level)
  }, [courseOptions, level])

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value && value !== "ALL" && value.length > 0) {
        params.set(key, value)
      } else {
        params.delete(key)
      }

      params.delete("page")

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}` as Route)
      })
    },
    [pathname, router, searchParams]
  )

  const hasActiveFilters =
    Boolean(searchParams.get("search")) ||
    status !== "ALL" ||
    Boolean(subject) ||
    Boolean(level) ||
    Boolean(course) ||
    sort !== "newest"

  const clearFilters = () => {
    setSearchValue("")
    startTransition(() => {
      router.push(pathname as Route)
    })
  }

  useEffect(() => {
    const query = searchValue.trim()

    const timeout = setTimeout(() => {
      const currentSearch = searchParams.get("search") ?? ""
      if (query === currentSearch) return

      const params = new URLSearchParams(searchParams.toString())

      if (query) {
        params.set("search", query)
      } else {
        params.delete("search")
      }

      params.delete("page")

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}` as Route)
      })
    }, 400)

    return () => clearTimeout(timeout)
  }, [searchValue, searchParams, pathname, router, startTransition])

  return (
    <div className="flex flex-col gap-3">
      <InputGroup>
        <InputGroupInput
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search by title, subject, category, course, or topic"
          className="pl-9"
        />
        <InputGroupAddon>
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
            className="size-4 text-muted-foreground"
          />
        </InputGroupAddon>
      </InputGroup>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          value={status}
          onValueChange={(value) => updateParam("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {NOTE_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {STATUS_CONFIG[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <SearchSelect
          value={subject}
          onChange={(value: string | string[]) =>
            updateParam(
              "subject",
              Array.isArray(value) ? (value[0] ?? null) : value || null
            )
          }
          options={subjectOptions.map((option) => ({
            id: option.value,
            name: option.label,
          }))}
          placeholder="All subjects"
          searchPlaceholder="Search subjects..."
        />

        <SearchSelect
          value={level}
          onChange={(value: string | string[]) => {
            const singleValue = Array.isArray(value)
              ? (value[0] ?? null)
              : value || null
            updateParam("level", singleValue)
            updateParam("course", null)
          }}
          options={levelOptions.map((option) => ({
            id: option.value,
            name: option.label,
          }))}
          placeholder="All education levels"
          searchPlaceholder="Search levels..."
        />

        <SearchSelect
          value={course}
          onChange={(value: string | string[]) =>
            updateParam(
              "course",
              Array.isArray(value) ? (value[0] ?? null) : value || null
            )
          }
          options={filteredCourseOptions.map((option) => ({
            id: option.value,
            name: option.label,
          }))}
          placeholder="All courses"
          searchPlaceholder="Search courses..."
          disabled={!level}
        />

        <Select
          value={sort}
          onValueChange={(value) => updateParam("sort", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters ? (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit text-muted-foreground"
          onClick={clearFilters}
        >
          Clear filters
        </Button>
      ) : null}
    </div>
  )
}

export function ContributionFilters(props: ContributionFiltersProps) {
  return (
    <>
      <div className="hidden rounded-xl border bg-card p-4 md:block">
        <FilterFields {...props} />
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" className="w-full gap-2">
                <HugeiconsIcon
                  icon={FilterIcon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="size-4"
                />
                Filters
              </Button>
            }
          ></SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[85vh] overflow-y-auto px-4 pb-6"
          >
            <SheetHeader className="px-0 pb-0">
              <SheetTitle className={"text-lg"}>
                Filter contributions
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterFields {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
