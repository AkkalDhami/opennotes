"use client"

import { useCallback, useId, useState } from "react"
import type { KeyboardEvent, MouseEvent } from "react"

import { useSearchSuggestions } from "@/hooks/use-search-suggestions"
import type { NoteSuggestion } from "@/lib/search/search-types"
import { cn } from "@/lib/utils"

function formatSuggestion(suggestion: NoteSuggestion): string {
  if (suggestion.kind === "title") return suggestion.label
  return suggestion.label
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const KIND_LABEL: Record<NoteSuggestion["kind"], string> = {
  subject: "Subject",
  topic: "Topic",
  title: "Note",
}

interface UseSearchAutocompleteOptions {
  /** The current input value. */
  value: string
  /** Called when a suggestion is picked or Enter is pressed. */
  onSubmit: (value: string) => void
  enabled?: boolean
}

export function useSearchAutocomplete({
  value,
  onSubmit,
  enabled = true,
}: UseSearchAutocompleteOptions) {
  const listboxId = useId()
  const [isFocused, setIsFocused] = useState(false)
  const [dismissedQuery, setDismissedQuery] = useState<string | null>(null)
  const [active, setActive] = useState<{ query: string; index: number }>({
    query: "",
    index: -1,
  })

  // Escape dismisses the *current* query's suggestions. Typing anything makes
  // the query different, which reopens the list — no effect needed to reset.
  const isDismissed = dismissedQuery === value

  const { suggestions, isLoading } = useSearchSuggestions(value, {
    enabled: enabled && isFocused && !isDismissed,
  })

  const isOpen = isFocused && !isDismissed && suggestions.length > 0

  const activeIndex =
    active.query === value && active.index < suggestions.length
      ? active.index
      : -1

  const optionId = useCallback(
    (index: number) => `${listboxId}-option-${index}`,
    [listboxId]
  )

  const close = useCallback(() => {
    setDismissedQuery(value)
    setActive({ query: value, index: -1 })
  }, [value])

  const select = useCallback(
    (suggestion: NoteSuggestion) => {
      // Submit what the user actually saw, not the underlying slug. These are
      // equivalent as far as matching goes — the normalizer turns
      // "computer-science" into "computer science" either way — so the
      // readable form wins for the input box and the shareable URL.
      const text = formatSuggestion(suggestion)
      setDismissedQuery(text)
      setActive({ query: text, index: -1 })
      onSubmit(text)
    },
    [onSubmit]
  )

  const move = useCallback(
    (delta: number) => {
      if (suggestions.length === 0) return
      // There are length+1 states: -1 (nothing highlighted, showing what the
      // user typed) plus each option. Shift into 0..length, rotate, shift
      // back — so ArrowUp from a fresh list lands on the last option and
      // ArrowDown past the end returns to the typed text.
      const slots = suggestions.length + 1
      const next = ((activeIndex + 1 + delta + slots) % slots) - 1
      setActive({ query: value, index: next })
    },
    [activeIndex, suggestions.length, value]
  )

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setDismissedQuery(null)
        move(1)
        break
      case "ArrowUp":
        event.preventDefault()
        move(-1)
        break
      case "Enter": {
        event.preventDefault()
        const picked = activeIndex >= 0 ? suggestions[activeIndex] : undefined
        if (picked) {
          select(picked)
        } else {
          close()
          onSubmit(value)
        }
        break
      }
      case "Escape":
        // Only swallow the key if there was something to close, so Escape can
        // still bubble to a surrounding dialog or clear a native search input.
        if (isOpen) event.preventDefault()
        close()
        break
      case "Tab":
        close()
        break
    }
  }

  return {
    suggestions,
    isLoading,
    isOpen,
    activeIndex,
    listboxId,
    close,

    /** Spread onto the search `<input>`. */
    inputProps: {
      role: "combobox" as const,
      "aria-expanded": isOpen,
      "aria-controls": listboxId,
      "aria-autocomplete": "list" as const,
      "aria-activedescendant":
        activeIndex >= 0 ? optionId(activeIndex) : undefined,
      autoComplete: "off",
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      onKeyDown: handleKeyDown,
    },

    /** Spread onto each rendered option. */
    getOptionProps: (index: number): SuggestionOptionProps => ({
      id: optionId(index),
      role: "option" as const,
      "aria-selected": index === activeIndex,
      // Keep focus in the input so blur doesn't tear the list down before the
      // click lands.
      onMouseDown: (event: MouseEvent) => event.preventDefault(),
      onMouseEnter: () => setActive({ query: value, index }),
      onClick: () => select(suggestions[index]),
    }),
  }
}

export interface SuggestionOptionProps {
  id: string
  role: "option"
  "aria-selected": boolean
  onMouseDown: (event: MouseEvent) => void
  onMouseEnter: () => void
  onClick: () => void
}

interface SearchSuggestionsProps {
  suggestions: NoteSuggestion[]
  activeIndex: number
  listboxId: string
  getOptionProps: (index: number) => SuggestionOptionProps
  className?: string
}

/**
 * The suggestion list. Renders nothing when there's nothing to suggest —
 * an empty dropdown is worse than no dropdown, and "no matches" while someone
 * is still mid-word is noise rather than information.
 */
export function SearchSuggestions({
  suggestions,
  activeIndex,
  listboxId,
  getOptionProps,
  className,
}: SearchSuggestionsProps) {
  if (suggestions.length === 0) return null

  return (
    <ul
      id={listboxId}
      role="listbox"
      aria-label="Search suggestions"
      className={cn(
        "absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "animate-in fade-in-0 slide-in-from-top-1 motion-reduce:animate-none",
        className
      )}
    >
      {suggestions.map((suggestion, index) => (
        <li
          key={`${suggestion.kind}:${suggestion.label}`}
          {...getOptionProps(index)}
          className={cn(
            "flex cursor-pointer items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm",
            index === activeIndex
              ? "bg-accent text-accent-foreground"
              : "text-foreground"
          )}
        >
          <span className="truncate">{formatSuggestion(suggestion)}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {KIND_LABEL[suggestion.kind]}
          </span>
        </li>
      ))}
    </ul>
  )
}
