"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpDownIcon, Search01Icon } from "@hugeicons/core-free-icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Route } from "next"
import { Input } from "@/components/ui/input"

const SORTS = [
  { value: "recent", label: "Most recent" },
  { value: "saved", label: "Most saved" },
  { value: "viewed", label: "Most viewed" },
  { value: "downloaded", label: "Most downloaded" },
  { value: "notes", label: "Most notes" },
  { value: "updated", label: "Recently updated" },
  { value: "az", label: "A–Z" },
]

export function useUrlState() {
  const sp = useSearchParams(),
    router = useRouter(),
    path = usePathname()
  return (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString())
    for (const [k, v] of Object.entries(patch))
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      v ? next.set(k, v) : next.delete(k)
    next.delete("page")
    router.replace(`${path}?${next}` as Route, { scroll: false })
  }
}

export function CollectionSearch() {
  const sp = useSearchParams(),
    set = useUrlState()
  const [q, setQ] = useState(sp.get("q") ?? "")
  useEffect(() => {
    const t = setTimeout(
      () => q !== (sp.get("q") ?? "") && set({ q: q || null }),
      300
    )
    return () => clearTimeout(t)
  }, [q]) // eslint-disable-line
  return (
    <div className="relative">
      <HugeiconsIcon
        icon={Search01Icon}
        size={16}
        color="currentColor"
        strokeWidth={2}
        className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        aria-label="Search collections"
        placeholder="Search collections, subjects, courses, contributors..."
        className="h-14 pr-6 pl-12"
      />
    </div>
  )
}

export function CollectionSort() {
  const sp = useSearchParams(),
    set = useUrlState()
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Select
        items={SORTS}
        value={sp.get("sort") ?? "recent"}
        onValueChange={(v) =>
          set({ sort: v === "recent" ? null : (v as string) })
        }
      >
        <SelectTrigger
          size="sm"
          aria-labelledby="sort-label"
          className="min-w-40 text-foreground"
        >
          <HugeiconsIcon
            icon={ArrowUpDownIcon}
            size={18}
            color="currentColor"
            strokeWidth={2}
            className="size-4"
          />
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="end">
          {SORTS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
