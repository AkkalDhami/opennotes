import {
  EDUCATIONAL_LEVELS,
  GRADES,
  SUBJECTS,
} from "@/constants/notes.constants"
import { DEFAULT_PAGE_SIZE } from "@/types/note"

export const SEARCH_CONFIG = {
  /** Queries longer than this are truncated, not rejected (§4). */
  maxQueryLength: 200,

  /** Full-query fuzzy matching starts at four characters to avoid noise. */
  minFuzzyLength: 4,

  /** Short autocomplete prefixes may use trigrams with this stricter floor. */
  minPrefixFuzzyLength: 2,
  prefixTrigramThreshold: 0.45,

  /**
   * Similarity floor for typo-tolerant matches. The index-usable `%` operator
   * uses pg_trgm.similarity_threshold (default 0.3), so this must be >= 0.3.
   * The query re-checks similarity() after the index prefilter.
   */
  trigramThreshold: 0.34,

  /** Words this short are matched as prefixes instead of complete tsvectors. */
  prefixTokenLength: 3,

  /** Maximum edit distance for word-level typo correction. */
  maxFuzzyDistance: 2,
  defaultPageSize: DEFAULT_PAGE_SIZE,
  maxPageSize: 50,

  /** Minimum input length before autocomplete queries the database. */
  minSuggestLength: 2,
  /** Hard cap on the autocomplete dropdown, per kind and overall. */
  maxSuggestionsPerKind: 4,
  maxSuggestions: 8,
} as const

export const SEARCH_WEIGHTS = {
  titleExact: 10,
  topicExact: 8,
  subjectExact: 6,
  gradeExact: 6,
  educationLevelExact: 3,
  tagMatch: 5,
  contributorMatch: 2,
  fuzzyTitle: 3,
  prefixMatch: 6,
  titleFullText: 8,
  popularity: 1,
  freshness: 1,
} as const

/**
 * Documents the weights baked into `notes_build_search_vector()` in
 * src/db/sql/notes-search.sql. This object is not consumed at runtime — the
 * tsvector is built in the database — it exists so the weighting is visible
 * from the TypeScript side. If you change one, change both and re-run
 * `npm run db:search -- --rebuild`.
 *
 * `contributor` is deliberately absent: it lives on `users`, not `notes`, so
 * it cannot be part of the note's own tsvector. Contributor matching is a
 * separate ranking signal (SEARCH_WEIGHTS.contributorMatch).
 */
export const TSVECTOR_WEIGHTS = {
  title: "A",
  topic: "A",
  subject: "B",
  tags: "B",
  description: "C",
  course: "D",
  grade: "D",
  educationLevel: "D",
} as const

/**
 * Derived from the canonical `GRADES` constant in notes.constants.ts so the
 * search layer and the note-creation layer can never drift apart. Only
 * numeric school grades ("Grade 1" … "Grade 12") are extracted — SEE, +2,
 * semester/year grades, etc. are matched via their own aliases elsewhere.
 *
 * Values are the canonical `id`s (e.g. "grade-12"), which is exactly what
 * gets stored on `notes.grade` when a contributor submits a note — so
 * parsed grades always match the database.
 */
function buildGradeAliases(): Record<string, string> {
  const aliases: Record<string, string> = {}
  for (const grade of GRADES) {
    const match = grade.name.match(/^Grade (\d+)$/)
    if (match) {
      aliases[match[1]] = grade.id
    }
  }
  return aliases
}

export const GRADE_ALIASES = buildGradeAliases()

/**
 * Derived from the canonical `EDUCATIONAL_LEVELS` constant in
 * notes.constants.ts so parsed education levels match the values actually
 * stored on notes. Keys are user-typed level names ("bachelor's", "+2");
 * values are the canonical `id`s stored on `notes.educationLevel`
 * ("bachelor", "plus-two"). The extra aliases below are common
 * user-typed variants that don't exist as level names.
 */
function buildEducationLevelAliases(): Record<string, string> {
  const aliases: Record<string, string> = {}
  for (const level of EDUCATIONAL_LEVELS) {
    aliases[level.name.toLowerCase()] = level.id
  }
  Object.assign(aliases, {
    secondary: "school",
    "high school": "school",
    plus2: "plus-two",
    bachelors: "bachelor",
    undergraduate: "bachelor",
    masters: "master",
    postgraduate: "master",
  })
  return aliases
}

export const EDUCATION_LEVEL_ALIASES = buildEducationLevelAliases()

/**
 * Derived from the canonical `SUBJECTS` constant in notes.constants.ts so
 * every subject a contributor can pick is also searchable. Keys are
 * user-typed subject names ("physics", "computer science"); values are the
 * canonical `id`s stored on `notes.subject` ("physics",
 * "computer-science") — so parsed subjects always match the database. The
 * extra keys below are common abbreviations/synonyms that aren't subject
 * names.
 */
function buildSubjectAliases(): Record<string, string> {
  const aliases: Record<string, string> = {}
  for (const subject of SUBJECTS) {
    // Normalize whitespace in the key so "Database Management  Systems"
    // (double space in the source data) still matches a single-space query.
    const key = subject.name.toLowerCase().replace(/\s+/g, " ").trim()
    aliases[key] = subject.id
  }
  Object.assign(aliases, {
    phy: "physics",
    chem: "chemistry",
    bio: "biology",
    math: "mathematics",
    maths: "mathematics",
    computer: "computer-science",
    cs: "computer-science",
  })
  return aliases
}

export const SUBJECT_ALIASES = buildSubjectAliases()

/**
 * Words that appear in academic queries but carry no search-relevant
 * meaning on their own (§4). Deliberately short — the spec explicitly warns
 * against over-stripping tokens like "12", "ii", "bca", "c++".
 */
export const SEARCH_STOPWORDS = new Set([
  "notes",
  "note",
  "pdf",
  "the",
  "a",
  "an",
  "of",
  "for",
  "in",
  "on",
  "at",
  "by",
  "with",
  "from",
  "to",
  "and",
  "or",
  "but",
  "not",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
])
