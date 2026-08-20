"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { buildNotesUrl } from "@/utils/notes-url"
import { Route } from "next"

const DEBOUNCE_MS = 350

export function AdminNotesSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialQuery)
  const [, startTransition] = useTransition()

  // Keep the field in sync if the URL changes from elsewhere (e.g. "Clear filters").
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    const handle = setTimeout(() => {
      if (value === (searchParams.get("q") ?? "")) return
      const url = buildNotesUrl({
        current: searchParams,
        updates: { q: value || null },
      })
      startTransition(() => router.push(url as Route))
    }, DEBOUNCE_MS)

    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="relative w-full sm:max-w-sm">
      <HugeiconsIcon
        icon={Search01Icon}
        size={16}
        color="currentColor"
        strokeWidth={2}
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search notes by title, contributor, subject…"
        aria-label="Search notes"
        className="pl-9"
      />
    </div>
  )
}
