import { SEARCH_CONFIG } from "./search-constants"

/**
 * Normalizes a raw search query (§4). Deliberately conservative — this is
 * NOT the place to strip academically meaningful tokens like "12", "ii",
 * "bca", or "c++". It only handles whitespace, case, and punctuation noise.
 *
 * "  Class   12   Physics  "  → "class 12 physics"
 * "Physics - Ray Optics"      → "physics ray optics"
 */
export function normalizeSearchQuery(query: string): string {
  const truncated = query.slice(0, SEARCH_CONFIG.maxQueryLength)

  return (
    truncated
      .toLowerCase()
      .normalize("NFKC")
      // Collapse common separators (hyphens, slashes, colons, pipes) into
      // spaces rather than deleting them outright — "grade-12" should still
      // read as "grade 12", not "grade12".
      .replace(/[-/:|,]+/g, " ")
      // Strip punctuation that carries no academic meaning, but keep `+`
      // (as in "+2") and `.` inside words is already rare enough in this
      // dataset to drop safely (e.g. trailing periods from sentence-style
      // input).
      .replace(/[.,;!?"'`()[\]{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  )
}

/**
 * Tokenizes an already-normalized query into individual terms. Kept
 * separate from normalization so callers that already have a normalized
 * string (e.g. tests) don't pay for re-normalizing.
 */
export function tokenizeQuery(normalized: string): string[] {
  if (!normalized) return []
  return normalized.split(" ").filter(Boolean)
}
