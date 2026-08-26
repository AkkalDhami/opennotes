/**
 * Notes search — public surface.
 *
 * The database side of this feature is NOT created by `drizzle-kit push`.
 * Run `npm run db:search` once (and after any push that touched `notes`) to
 * install the tsvector trigger, pg_trgm and the GIN indexes. See
 * src/db/sql/notes-search.sql.
 */

export {
  searchNotes,
  suggestNotes,
  type NotesSearchIndex,
} from "./notes-search"

export type {
  NoteSuggestion,
  PublicNote,
  SearchNotesFilters,
  SearchNotesParams,
  SearchNotesResult,
  SearchSort,
} from "./search-types"

// Exported for tests and for callers that need to parse a query without
// running it (e.g. showing "searching Physics, Grade 12" above the results).
export { parseAcademicQuery, createSubjectResolver } from "./search-parser"
export { normalizeSearchQuery, tokenizeQuery } from "./search-normalizer"
export { SEARCH_CONFIG } from "./search-constants"
