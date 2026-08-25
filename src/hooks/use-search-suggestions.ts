"use client"

import { useEffect, useRef, useState } from "react"

import type { NoteSuggestion } from "@/lib/search/search-types"

/**
 * Mirrors SEARCH_CONFIG.minSuggestLength. Duplicated rather than imported so
 * a search box doesn't pull the server-side alias dictionaries into the client
 * bundle; the API enforces the real minimum, this only avoids pointless
 * requests.
 */
const MIN_QUERY_LENGTH = 2
const DEFAULT_DEBOUNCE_MS = 200

interface UseSearchSuggestionsOptions {
  /** Set false to stop fetching (e.g. while the dropdown is closed). */
  enabled?: boolean
  debounceMs?: number
}

interface UseSearchSuggestionsResult {
  suggestions: NoteSuggestion[]
  isLoading: boolean
}

/**
 * Debounced autocomplete against /api/search/suggest.
 *
 * Two things matter more than they look:
 *
 * 1. Every request is abortable, and a response is discarded unless it belongs
 *    to the query currently in the box. Without that, a slow request for "ph"
 *    can land after a fast one for "physics" and repopulate the dropdown with
 *    stale results.
 * 2. Results are memoised per query for the lifetime of the component, so
 *    backspacing through a word replays instantly instead of refetching every
 *    prefix.
 *
 * Failures resolve to an empty list. Autocomplete is an aid — if it breaks, the
 * search box must still work, so nothing here surfaces an error to the user.
 */
export function useSearchSuggestions(
  query: string,
  options: UseSearchSuggestionsOptions = {}
): UseSearchSuggestionsResult {
  const { enabled = true, debounceMs = DEFAULT_DEBOUNCE_MS } = options

  const [suggestions, setSuggestions] = useState<NoteSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const cacheRef = useRef(new Map<string, NoteSuggestion[]>())

  useEffect(() => {
    const trimmed = query.trim()

    if (!enabled || trimmed.length < MIN_QUERY_LENGTH) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([])
      setIsLoading(false)
      return
    }

    const cached = cacheRef.current.get(trimmed.toLowerCase())
    if (cached) {
      setSuggestions(cached)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    setIsLoading(true)

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          setSuggestions([])
          return
        }

        const payload = (await response.json()) as {
          success?: boolean
          data?: { suggestions?: NoteSuggestion[] }
        }

        const next = payload.data?.suggestions ?? []
        cacheRef.current.set(trimmed.toLowerCase(), next)
        setSuggestions(next)
      } catch {
        // Aborted or offline — leave whatever's on screen alone rather than
        // flashing an empty dropdown mid-typing.
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }, debounceMs)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, enabled, debounceMs])

  return { suggestions, isLoading }
}
