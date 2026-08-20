"use client"

import {
  SubmitEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Route } from "next"

type ReportStatusFilter = "OPEN" | "RESOLVED" | "DISMISSED"

const TABS: { label: string; value?: ReportStatusFilter }[] = [
  { label: "All" },
  { label: "Open", value: "OPEN" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Dismissed", value: "DISMISSED" },
]

const DEBOUNCE_MS = 350

export function ReportsFilters({
  activeStatus,
  search,
}: {
  activeStatus?: ReportStatusFilter
  search: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(search)
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [prevSearch, setPrevSearch] = useState(search)

  // Keep the input value in sync with the URL search param without
  // calling setState synchronously inside an effect body.
  if (prevSearch !== search) {
    setPrevSearch(search)
    setSearchValue(search)
  }

  const updateParams = useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(next)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      params.delete("page")
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}` as Route)
      })
    },
    [pathname, router, searchParams, startTransition]
  )

  const updateUrl = useCallback(
    (nextQuery: string) => {
      updateParams({ search: nextQuery || undefined })
    },
    [updateParams]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateUrl(searchValue), DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchValue, updateUrl])

  function handleSearchSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    updateUrl(searchValue)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="tablist"
        aria-label="Filter reports by status"
        className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1"
      >
        {TABS.map((tab) => {
          const isActive =
            tab.value === activeStatus || (!tab.value && !activeStatus)
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => updateParams({ status: tab.value })}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="relative w-full sm:w-72"
        role="search"
      >
        <HugeiconsIcon
          icon={Search01Icon}
          size={16}
          color="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search reports..."
          className="pl-9"
          aria-label="Search reports"
        />
      </form>
    </div>
  )
}
