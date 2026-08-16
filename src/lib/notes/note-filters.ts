import { NoteFilterState, NoteSortOption } from "@/types/note"

const VALID_SORTS: NoteSortOption[] = [
  "relevance",
  "downloads",
  "newest",
  "oldest",
]

function firstOrUndefined(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value || undefined
}

/**
 * Parses Next.js `searchParams` (from a Server Component's props) into a
 * typed filter state. This is the single source of truth for the URL
 * contract described in the brief, e.g.:
 *
 *   /notes?q=ray+optics
 *   /notes?subject=physics&grade=12
 *   /notes?q=physics&educationLevel=plus-two&sort=downloads&page=2
 */
export function parseNoteFilters(
  searchParams: Record<string, string | string[] | undefined>
): NoteFilterState {
  const q = firstOrUndefined(searchParams.q)
  const subject = firstOrUndefined(searchParams.subject)
  const grade = firstOrUndefined(searchParams.grade)
  const educationLevel = firstOrUndefined(searchParams.educationLevel)
  const topic = firstOrUndefined(searchParams.topic)
  const institution = firstOrUndefined(searchParams.institution)
  const academicYear = firstOrUndefined(searchParams.academicYear)
  const contributor = firstOrUndefined(searchParams.contributor)

  const rawTags = searchParams.tags
  const tags = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === "string"
      ? rawTags.split(",").filter(Boolean)
      : undefined

  const rawSort = firstOrUndefined(searchParams.sort) as
    NoteSortOption | undefined
  const sort = rawSort && VALID_SORTS.includes(rawSort) ? rawSort : undefined

  const rawPage = firstOrUndefined(searchParams.page)
  const parsedPage = rawPage ? parseInt(rawPage, 10) : undefined
  const page =
    parsedPage && Number.isFinite(parsedPage) && parsedPage > 0
      ? parsedPage
      : undefined

  return {
    q,
    subject,
    grade,
    educationLevel,
    topic,
    institution,
    academicYear,
    contributor,
    tags,
    sort,
    page,
  }
}

/** Default sort: "relevance" when a query is present, otherwise "newest". */
export function resolveDefaultSort(filters: NoteFilterState): NoteSortOption {
  if (filters.sort) return filters.sort
  return filters.q ? "relevance" : "newest"
}

/**
 * Builds a query string from a filter state, dropping empty/undefined
 * values so URLs stay clean. Used by client components (search, filters,
 * sort, pagination, tag links) to update the URL without hand-rolling
 * string concatenation in five different places.
 */
export function buildNoteFiltersQuery(
  filters: NoteFilterState,
  overrides: Partial<NoteFilterState> = {}
): string {
  const merged: NoteFilterState = { ...filters, ...overrides }
  const params = new URLSearchParams()

  if (merged.q) params.set("q", merged.q)
  if (merged.subject) params.set("subject", merged.subject)
  if (merged.grade) params.set("grade", merged.grade)
  if (merged.educationLevel) params.set("educationLevel", merged.educationLevel)
  if (merged.topic) params.set("topic", merged.topic)
  if (merged.institution) params.set("institution", merged.institution)
  if (merged.academicYear) params.set("academicYear", merged.academicYear)
  if (merged.contributor) params.set("contributor", merged.contributor)
  if (merged.tags && merged.tags.length > 0)
    params.set("tags", merged.tags.join(","))
  if (merged.sort) params.set("sort", merged.sort)
  // Changing any filter (other than page itself) should reset pagination,
  // so callers pass page explicitly via overrides when they want to keep it.
  if (merged.page && merged.page > 1) params.set("page", String(merged.page))

  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export interface ActiveFilterChip {
  key: keyof NoteFilterState
  label: string
  /** For multi-value filters like tags, the specific value this chip represents. */
  value?: string
}

/** Human-readable chips for the "active filters" row, e.g. "Physics ×", "Grade 12 ×". */
export function getActiveFilterChips(
  filters: NoteFilterState,
  labels: {
    gradePrefix?: string
    educationLevelLabels?: Record<string, string>
  } = {}
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  if (filters.subject)
    chips.push({ key: "subject", label: capitalize(filters.subject) })
  if (filters.grade)
    chips.push({
      key: "grade",
      label: `${labels.gradePrefix ?? "Grade"} ${filters.grade}`,
    })
  if (filters.educationLevel)
    chips.push({
      key: "educationLevel",
      label:
        labels.educationLevelLabels?.[filters.educationLevel] ??
        capitalize(filters.educationLevel),
    })
  if (filters.topic)
    chips.push({ key: "topic", label: capitalize(filters.topic) })
  if (filters.institution)
    chips.push({ key: "institution", label: filters.institution })
  if (filters.academicYear)
    chips.push({ key: "academicYear", label: filters.academicYear })
  if (filters.contributor)
    chips.push({ key: "contributor", label: filters.contributor })
  for (const tag of filters.tags ?? []) {
    chips.push({ key: "tags", value: tag, label: `#${tag}` })
  }

  return chips
}

export function hasActiveFilters(filters: NoteFilterState): boolean {
  return (
    Boolean(filters.q) ||
    Boolean(filters.subject) ||
    Boolean(filters.grade) ||
    Boolean(filters.educationLevel) ||
    Boolean(filters.topic) ||
    Boolean(filters.institution) ||
    Boolean(filters.academicYear) ||
    Boolean(filters.contributor) ||
    Boolean(filters.tags && filters.tags.length > 0)
  )
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
