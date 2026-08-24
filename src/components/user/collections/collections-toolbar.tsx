"use client"

import { useCallback, useState, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import debounce from "debounce"

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
import { Route } from "next"
import {
  CollectionView,
  CollectionViewSwitcher,
} from "./collection-view-switcher"

const SORT_OPTIONS = [
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Recently created" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
] as const

export function CollectionsToolbar({
  defaultQuery,
  defaultSort,
  defaultView,
}: {
  defaultQuery?: string
  defaultSort?: string
  defaultView?: CollectionView
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(defaultQuery)
  const [, startTransition] = useTransition()

  const pushParams = useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(next)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      startTransition(() =>
        router.replace(`${pathname}?${params.toString()}` as Route)
      )
    },
    [pathname, router, searchParams]
  )

  const debouncedSearch = debounce((value: string) => {
    pushParams({ q: value || undefined })
  }, 300)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full flex-1">
        <HugeiconsIcon
          icon={Search01Icon}
          size={18}
          color="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            debouncedSearch(e.target.value)
          }}
          inputMode="search"
          type="search"
          placeholder="Search my collections..."
          aria-label="Search my collections"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <CollectionViewSwitcher value={defaultView || "grid"} />
        <Select
          defaultValue={defaultSort}

          onValueChange={(value) => pushParams({ sort: value || undefined })}
        >
          <SelectTrigger
            className="w-full sm:w-52"
            aria-label="Sort collections"
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Default</SelectItem>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
