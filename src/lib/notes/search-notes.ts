/**
 * @deprecated Superseded by `@/lib/search`.
 *
 * This module used to be the live notes search: a single `ILIKE '%term%'`
 * across title/description/subject/topic/tags/contributor. That worked, but it
 * could not use an index (a leading wildcard rules out btree), it could not
 * rank (a title match and a description match scored identically), and it had
 * no tolerance for typos or for the way people actually phrase queries
 * ("class 12 physics ray optics").
 *
 * `@/lib/search` replaces it with real Postgres full-text search — a weighted
 * `tsvector` + GIN index, `ts_rank` relevance, and a `pg_trgm` fuzzy fallback.
 * The public contract is unchanged (`searchNotes(params) => SearchNotesResult`)
 * so this file exists only to keep any straggling import working.
 *
 * Two behavioural differences worth knowing if you land here from an old
 * import:
 *
 * 1. `params.institution` is ignored — there is no such column on `notes`.
 *    The old implementation had a dangling `if (params.institution)` that
 *    accidentally gated the `academicYear` filter behind it, so academicYear
 *    was silently dropped on every normal request. It now applies.
 * 2. A query with no matches returns 0 results instead of the whole table
 *    ranked arbitrarily.
 *
 * Import from `@/lib/search` in new code; this file can be deleted once
 * nothing references it.
 */

export { searchNotes, suggestNotes, type NotesSearchIndex } from "@/lib/search"
