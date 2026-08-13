"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

interface HeroSearchProps {
  className?: string
  action?: string
}

export function HeroSearch({ className, action = "/search" }: HeroSearchProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  function handleSubmit(event: React.ChangeEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    const destination = trimmed
      ? `${action}?q=${encodeURIComponent(trimmed)}`
      : action
    router.push(destination)
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("w-full", className)}
    >
      <label htmlFor="hero-search-input" className="sr-only">
        Search notes, subjects, topics
      </label>

      <InputGroup className="px-4 py-6">
        <InputGroupInput
          id="hero-search-input"
          name="q"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search notes, subjects, topics..."
        />
        <InputGroupAddon className="mr-2">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="shrink-0 text-muted-foreground transition-colors group-focus-within:text-[#2563EB]"
            aria-hidden="true"
          />
        </InputGroupAddon>
        {/* <InputGroupAddon align="inline-end">
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={20}
            strokeWidth={2}
            aria-hidden="true"
          />
        </InputGroupAddon> */}
      </InputGroup>
    </form>
  )
}
