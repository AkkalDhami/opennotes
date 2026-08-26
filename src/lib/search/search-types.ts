/**
 * Types for the notes search engine.
 *
 * DESIGN RULE: the *public* contract is not defined here — it is imported
 * from `@/types/note`, which is what the discovery page, `NoteGrid`,
 * `NoteCard` and pagination already consume. Duplicating a second
 * `PublicNote`/`SearchNotesResult` shape here is what let the previous
 * version of this module drift into unusable dead code: it returned
 * `{ items: [{ note }] }` while every component expected `{ notes }`.
 *
 * So: UI-facing shapes are re-exported from `@/types/note`; only things the
 * UI must never see (parsed queries, ranking debug info) are defined here.
 * Nothing PostgreSQL-specific — tsquery, tsvector, trigram scores — may
 * appear in any exported type.
 */

import type {
  NoteFilterState,
  NoteSortOption,
  PublicNote,
  SearchNotesParams,
  SearchNotesResult,
} from "@/types/note"

export type {
  NoteFilterState,
  NoteSortOption,
  PublicNote,
  SearchNotesParams,
  SearchNotesResult,
}

/**
 * The sorts the engine can execute. A superset of `NoteSortOption`: `views`
 * is orderable in the database (`notes.view_count`, with a partial index)
 * even if a given UI build doesn't expose it as a dropdown option.
 */
export type SearchSort = NoteSortOption | "views"

/**
 * The filter half of `SearchNotesParams`, minus the query/sort/paging
 * fields. Structural filters are exact-match `WHERE` clauses; the query is
 * ranked. Keeping them apart is what makes "filters narrow, query ranks"
 * enforceable rather than a comment.
 *
 * Deliberately omits `institution` from `NoteFilterState` — there is no
 * `institution` column on `notes`, so it can never be honoured. It stays in
 * the URL-level `NoteFilterState` for backwards compatibility only.
 */
export interface SearchNotesFilters {
  subject?: string
  grade?: string
  educationLevel?: string
  topic?: string
  academicYear?: string
  course?: string
  contributorId?: string
  contributorUsername?: string
  tags?: string[]
}

// ---------------------------------------------------------------------------
// Academic query parsing (§5)
// ---------------------------------------------------------------------------

export interface ParsedAcademicQuery {
  original: string
  normalized: string

  grade?: string
  educationLevel?: string
  subject?: string

  /** Remaining terms that look like they identify a specific topic. */
  topicTerms: string[]
  /** Remaining terms that don't map to any recognized academic field. */
  generalTerms: string[]

  tokens: string[]
}

// ---------------------------------------------------------------------------
// Autocomplete
// ---------------------------------------------------------------------------

export interface NoteSuggestion {
  /** What the user sees, and what gets pushed into `?q=` when picked. */
  label: string
  /** What kind of thing this suggestion represents, for UI grouping. */
  kind: "subject" | "topic" | "title"
}
