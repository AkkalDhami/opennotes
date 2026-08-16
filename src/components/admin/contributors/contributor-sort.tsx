"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ContributorSort } from "@/lib/admin/queries"
import { Route } from "next"

const OPTIONS: { value: ContributorSort; label: string }[] = [
  { value: "contributions", label: "Most Contributions" },
  { value: "recent", label: "Recently Joined" },
  { value: "name", label: "Name A-Z" },
]

export function ContributorSortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current =
    (searchParams.get("sort") as ContributorSort | null) ?? "contributions"

  function handleChange(next: ContributorSort | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (next === null || next === "contributions") {
      params.delete("sort")
    } else {
      params.set("sort", next)
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}` as Route)
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger aria-label="Sort contributors" className="w-47.5">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
