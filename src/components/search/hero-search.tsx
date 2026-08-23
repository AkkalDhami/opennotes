"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import debounce from "debounce"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Route } from "next"

interface HeroSearchProps {
  className?: string
  action?: string
  placeholder?: string
}

export function HeroSearch({
  className,
  action = "/notes",
  placeholder = "Search notes, descriptions, subjects, topics...",
}: HeroSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = React.useState(searchParams.get("q") ?? "")

  const search = React.useMemo(
    () =>
      debounce((value: string) => {
        const trimmed = value.trim()

        const params = new URLSearchParams(searchParams.toString())

        if (trimmed) {
          params.set("q", trimmed)
        } else {
          params.delete("q")
        }

        const queryString = params.toString()

        router.push(
          (queryString ? `${action}?${queryString}` : action) as Route,
          {
            scroll: false,
          }
        )
      }, 400),
    [router, action, searchParams]
  )

  React.useEffect(() => {
    return () => {
      search.clear()
    }
  }, [search])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value

    setQuery(value)
    search(value)
  }

  return (
    <div className={cn("w-full", className)}>
      <label htmlFor="hero-search-input" className="sr-only">
        Search notes, descriptions, subjects, and topics
      </label>

      <InputGroup
        className={cn(
          "h-14 rounded-lg border bg-background px-2",
          "shadow-sm transition-all duration-200",
          "focus-within:border-primary/50",
          "focus-within:ring-4 focus-within:ring-primary/10"
        )}
      >
        <InputGroupAddon className="mr-2 pl-3">
          <HugeiconsIcon
            icon={Search01Icon}
            size={21}
            strokeWidth={2}
            className="shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </InputGroupAddon>

        <InputGroupInput
          id="hero-search-input"
          name="q"
          type="search"
          inputMode="search"
          autoComplete="off"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="h-full text-base"
        />
      </InputGroup>
    </div>
  )
}
