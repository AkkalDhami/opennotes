import { PostgresNotesSearchIndex } from "./postgres-notes-search"
import type {
  NoteSuggestion,
  SearchNotesParams,
  SearchNotesResult,
} from "./search-types"

/**
 * The boundary between "how notes are searched" and "what the UI asks for".
 * Everything PostgreSQL-specific — tsquery, tsvector, trigram thresholds,
 * weighted CASE expressions — lives behind this interface and must never
 * appear in its signatures.
 */
export interface NotesSearchIndex {
  search(params: SearchNotesParams): Promise<SearchNotesResult>
  suggest(query: string): Promise<NoteSuggestion[]>
}

const index: NotesSearchIndex = new PostgresNotesSearchIndex()

/**
 * Search published notes. The single entry point for the discovery page and
 * any server component that lists notes.
 *
 * Install the database-side search infrastructure with `npm run db:search`.
 * The engine combines trigger-maintained full-text vectors, indexed trigram
 * matching, word-prefix matching, and a bounded edit-distance fallback. If
 * pg_trgm is unavailable, full-text and parameterized prefix matching still
 * work without emitting SQL that would fail the whole request.
 */
export async function searchNotes(
  params: SearchNotesParams
): Promise<SearchNotesResult> {
  return index.search(params)
}

/** Autocomplete suggestions for a partially-typed query. */
export async function suggestNotes(query: string): Promise<NoteSuggestion[]> {
  return index.suggest(query)
}
