"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search01Icon, RefreshIcon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Route } from "next";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
  { value: "REMOVED", label: "Removed" },
  { value: "DRAFT", label: "Draft" },
]

const DEBOUNCE_MS = 350

export function ContributionFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [subject, setSubject] = useState(searchParams.get("subject") ?? "")
  const [category, setCategory] = useState(searchParams.get("category") ?? "")

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }

      // Any filter change resets pagination back to page 1.
      params.delete("page")

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}` as Route)
      })
    },
    [pathname, router, searchParams]
  )

  // Debounced text inputs — push to URL only after the user pauses typing.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateParams({ search, subject, category })
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, subject, category])

  // Ensure the default status is reflected in the URL params.
  useEffect(() => {
    if (!searchParams.get("status")) {
      updateParams({ status: "ALL" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const status = searchParams.get("status") ?? "ALL"
  const educationLevel = searchParams.get("educationLevel") ?? ""
  const dateFrom = searchParams.get("dateFrom") ?? ""
  const dateTo = searchParams.get("dateTo") ?? ""

  const hasActiveFilters =
    search || subject || category || educationLevel || dateFrom || dateTo || status !== "ALL"

  function clearAll() {
    setSearch("")
    setSubject("")
    setCategory("")
    startTransition(() => {
      router.push(`${pathname}?status=ALL` as Route)
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            strokeWidth={2}
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, contributor name, username, or email..."
            className="pl-9"
            aria-label="Search contributions"
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) => updateParams({ status: value ?? "ALL" })}
        >
          <SelectTrigger className="w-full lg:w-45" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="sm:w-40"
          aria-label="Filter by subject"
        />
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="sm:w-40"
          aria-label="Filter by category"
        />
        <Input
          value={educationLevel}
          onChange={(e) => updateParams({ educationLevel: e.target.value })}
          placeholder="Education level"
          className="sm:w-40"
          aria-label="Filter by education level"
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => updateParams({ dateFrom: e.target.value })}
          className="sm:w-40"
          aria-label="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => updateParams({ dateTo: e.target.value })}
          className="sm:w-40"
          aria-label="To date"
        />

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} className="size-4" aria-hidden="true" />
              Clear
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.refresh()}
            disabled={isPending}
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={16}
              strokeWidth={2}
              className={isPending ? "size-4 animate-spin" : "size-4"}
              aria-hidden="true"
            />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  )
}
