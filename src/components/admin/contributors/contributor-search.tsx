"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { Route } from "next";
import { HugeiconsIcon } from "@hugeicons/react";

const DEBOUNCE_MS = 350

export function ContributorSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("search") ?? "")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleChange(next: string) {
    setValue(next)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (next.trim()) {
        params.set("search", next.trim())
      } else {
        params.delete("search")
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}` as Route)
    }, DEBOUNCE_MS)
  }

  return (
    <div className="relative">
      <HugeiconsIcon
        icon={Search01Icon}
        size={21}
        strokeWidth={2}
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search contributors..."
        aria-label="Search contributors by name or username"
        className="pl-9"
      />
    </div>
  )
}
