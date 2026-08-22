import type { NoteSourceType } from "@/db"

// ---------------------------------------------------------------------------
// Public contract — this is the ONLY shape the UI is allowed to depend on.
// Everything PostgreSQL-specific (tsquery, tsvector, trigram scores, weighted
// CASE expressions, etc.) lives behind `NotesSearchIndex` and must never leak
// into these types.
// ---------------------------------------------------------------------------

export type SearchSort =
  "relevance" | "downloads" | "views" | "newest" | "oldest"

export interface SearchNotesFilters {
  subject?: string
  grade?: string
  educationLevel?: string
  topic?: string
  academicYear?: string
  course?: string
  contributorId?: string
  tags?: string[]
}

export interface SearchNotesParams {
  query?: string
  filters?: SearchNotesFilters
  sort?: SearchSort
  page?: number
  pageSize?: number
}

export interface PublicNoteContributor {
  id: string
  name: string
  username: string
}

/**
 * Kept intentionally close to the existing `PublicNote` contract (§35).
 * `fileType` isn't a real column on `notes` — it's derived from
 * `originalFileName`'s extension at the search-index boundary, so the UI
 * doesn't need to know that.
 */
export interface PublicNote {
  id: string
  slug: string
  title: string
  description: string | null
  subject: string
  grade: string
  educationLevel: string
  course: string
  topic: string | null
  academicYear: string | null
  tags: string[]
  fileType: string | null
  pageCount: number | null
  fileSizeBytes: number
  downloadCount: number
  originalAuthor: string | null
  sourceType: NoteSourceType
  sourceUrl: string | null
  publishedAt: Date | null
  contributor: PublicNoteContributor
}

/**
 * Internal-only relevance breakdown (§25). Useful for debugging/tuning the
 * ranking model. Never send this to the client in production — treat it the
 * same way you'd treat any other moderation/internal metadata.
 */
export interface SearchMatchMetadata {
  titleExact: boolean
  titlePhrase: boolean
  topicExact: boolean
  subjectExact: boolean
  gradeExact: boolean
  educationLevelExact: boolean
  tagMatch: boolean
  contributorMatch: boolean
  fuzzyMatch: boolean
  fullTextRank: number
  trigramSimilarity: number
  popularityScore: number
  freshnessScore: number
  finalScore: number
}

export interface SearchResultItem {
  note: PublicNote
  /** Present only when the caller explicitly asks for match debug info. */
  match?: SearchMatchMetadata
}

export interface SearchNotesResult {
  items: SearchResultItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  /** Set when zero results were found and a plausible correction exists. */
  didYouMean?: string
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
// Suggestions (§29) — architectural boundary only for V1.
// ---------------------------------------------------------------------------

export interface NoteSuggestion {
  label: string
  /** What kind of thing this suggestion represents, for UI grouping. */
  kind: "subject" | "topic" | "title"
}
