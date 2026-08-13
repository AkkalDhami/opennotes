"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      return
    }

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="group flex h-14 w-full items-center rounded-xl border border-[#E2E8F0] bg-white p-1.5 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all focus-within:border-[#2563EB]/50 focus-within:shadow-[0_4px_28px_rgba(37,99,235,0.10)] sm:h-16"
    >
      <label htmlFor="hero-search" className="sr-only">
        Search notes, subjects, topics
      </label>

      <HugeiconsIcon
        icon={Search01Icon}
        size={21}
        strokeWidth={1.8}
        className="ml-3 shrink-0 text-[#64748B]"
        aria-hidden="true"
      />

      <input
        id="hero-search"
        name="q"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search notes, subjects, topics..."
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8] sm:text-base"
      />

      <button
        type="submit"
        aria-label="Search notes"
        disabled={!query.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white transition-all hover:bg-[#1D4ED8] focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 sm:h-12 sm:w-12"
      >
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={20}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
    </form>
  )
}
