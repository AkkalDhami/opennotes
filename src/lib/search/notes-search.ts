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
 * Requires the database-side search infrastructure to be installed
 * (`npm run db:search`). Without it `notes.search_vector` is NULL on every
 * row and full-text matching finds nothing — the fuzzy and exact-metadata
 * signals still work, so this degrades to poor results rather than an error,
 * which is exactly why it's easy to miss.
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
