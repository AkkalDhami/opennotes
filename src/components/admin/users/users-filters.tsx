"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserRole } from "@/lib/admin/users"
import { Route } from "next"

interface UsersFiltersProps {
  search: string
  role?: UserRole
  verified?: boolean
  hasActiveFilters: boolean
}

const SEARCH_DEBOUNCE_MS = 400

export function UsersFilters({
  search,
  role,
  verified,
  hasActiveFilters,
}: UsersFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = React.useState(search)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchValue(search)
  }, [search])

  const updateParams = React.useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }

      if (resetPage) {
        params.delete("page")
      }

      const query = params.toString()
      router.push((query ? `${pathname}?${query}` : pathname) as Route, {
        scroll: false,
      })
    },
    [pathname, router, searchParams]
  )

  React.useEffect(() => {
    const trimmed = searchValue.trim()
    if (trimmed === (search ?? "")) return

    const timeout = setTimeout(() => {
      updateParams({ search: trimmed || null })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:max-w-sm sm:flex-1">
        <HugeiconsIcon
          icon={Search01Icon}
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search by name, email, or username..."
          className="px-9"
          aria-label="Search users"
        />
      </div>

      <Select
        value={role ?? "all"}
        onValueChange={(value) =>
          updateParams({ role: value === "all" ? null : value })
        }
      >
        <SelectTrigger className="w-full sm:w-40" aria-label="Filter by role">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={verified === undefined ? "all" : String(verified)}
        onValueChange={(value) =>
          updateParams({ verified: value === "all" ? null : value })
        }
      >
        <SelectTrigger
          className="w-full sm:w-48"
          aria-label="Filter by email verification"
        >
          <SelectValue placeholder="All email statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All email statuses</SelectItem>
          <SelectItem value="true">Verified</SelectItem>
          <SelectItem value="false">Unverified</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearchValue("")
            router.push(pathname as Route, { scroll: false })
          }}
        >
          Reset
        </Button>
      ) : null}
    </div>
  )
}
