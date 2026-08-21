import { ReadonlyURLSearchParams } from "next/navigation"

const FILTER_PARAM_KEYS = [
  "q",
  "status",
  "subject",
  "educationLevel",
  "sourceType",
  "processingStatus",
  "sort",
] as const

interface BuildNotesUrlOptions {
  current: ReadonlyURLSearchParams | URLSearchParams
  updates: Record<string, string | null | undefined>
}

export function buildNotesUrl({
  current,
  updates,
}: BuildNotesUrlOptions): string {
  const params = new URLSearchParams(current.toString())

  let touchedFilter = false
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === "") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    if ((FILTER_PARAM_KEYS as readonly string[]).includes(key)) {
      touchedFilter = true
    }
  }

  if (touchedFilter && !("page" in updates)) {
    params.delete("page")
  }

  const query = params.toString()
  return query ? `/admin/notes?${query}` : "/admin/notes"
}

export function clearAllFiltersUrl(): string {
  return "/admin/notes"
}
