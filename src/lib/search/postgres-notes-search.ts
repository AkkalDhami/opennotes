import { and, asc, desc, eq, exists, or, sql, type SQL } from "drizzle-orm"

import { bookmarks, db, notes, users } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"

import { SEARCH_CONFIG } from "./search-constants"
import type { NotesSearchIndex } from "./notes-search"
import { createSubjectResolver, parseAcademicQuery } from "./search-parser"
import { buildRankingExpressions } from "./search-ranking"
import { getSearchWords, isFuzzyWordMatch } from "./search-query"
import { normalizeSearchQuery } from "./search-normalizer"
import type {
  NoteSuggestion,
  ParsedAcademicQuery,
  PublicNote,
  SearchNotesFilters,
  SearchNotesParams,
  SearchNotesResult,
  SearchSort,
} from "./search-types"

// ---------------------------------------------------------------------------
// Known-subject cache
// ---------------------------------------------------------------------------
// The parser needs to know which subjects actually exist so it can recognise
// ones that aren't in the curated alias table (a contributor may type
// "Nepali Literature"). That's one cheap DISTINCT query, cached briefly —
// per-process, so a new subject becomes searchable within ~5 minutes without
// any invalidation plumbing.

let knownSubjectsCache: { subjects: string[]; expiresAt: number } | null = null
const KNOWN_SUBJECTS_TTL_MS = 5 * 60 * 1000

async function getKnownSubjects(): Promise<string[]> {
  if (knownSubjectsCache && knownSubjectsCache.expiresAt > Date.now()) {
    return knownSubjectsCache.subjects
  }

  const rows = await db
    .selectDistinct({ subject: notes.subject })
    .from(notes)
    .where(eq(notes.status, "PUBLISHED"))

  const subjects = rows.map((r) => r.subject).filter(Boolean)
  knownSubjectsCache = {
    subjects,
    expiresAt: Date.now() + KNOWN_SUBJECTS_TTL_MS,
  }
  return subjects
}

/** Exposed so `db:seed`/tests can force a re-read without waiting out the TTL. */
export function clearKnownSubjectsCache(): void {
  knownSubjectsCache = null
}

// Fuzzy search is optional infrastructure: a database without pg_trgm can
// still serve full-text and exact matches. Probe for both the function and the
// operator before emitting SQL that references them, otherwise a 4+ character
// query fails the entire Server Component render.
let trigramSupportCache: { available: boolean; expiresAt: number } | null = null
const TRIGRAM_SUPPORT_TTL_MS = 5 * 60 * 1000

async function supportsTrigramSearch(): Promise<boolean> {
  if (trigramSupportCache && trigramSupportCache.expiresAt > Date.now()) {
    return trigramSupportCache.available
  }

  const result = await db.execute(sql`
    SELECT
      to_regprocedure('similarity(text, text)') IS NOT NULL
      AND to_regoperator('%(text, text)') IS NOT NULL AS available
  `)
  const available = result.rows[0]?.available === true

  trigramSupportCache = {
    available,
    expiresAt: Date.now() + TRIGRAM_SUPPORT_TTL_MS,
  }
  return available
}

// ---------------------------------------------------------------------------
// Row → PublicNote
// ---------------------------------------------------------------------------

function noteSelection(isBookmarked: SQL<boolean>) {
  return {
    id: notes.id,
    slug: notes.slug,
    title: notes.title,
    description: notes.description,
    subject: notes.subject,
    category: notes.category,
    grade: notes.grade,
    educationLevel: notes.educationLevel,
    course: notes.course,
    topic: notes.topic,
    academicYear: notes.academicYear,
    tags: notes.tags,
    pageCount: notes.pageCount,
    fileSizeBytes: notes.fileSizeBytes,
    viewCount: notes.viewCount,
    downloadCount: notes.downloadCount,
    sourceType: notes.sourceType,
    sourceUrl: notes.sourceUrl,
    originalAuthor: notes.originalAuthor,
    publishedAt: notes.publishedAt,
    lastModifiedAt: notes.updatedAt,
    contributorId: users.id,
    contributorName: users.name,
    contributorUsername: users.username,
    contributorAvatarUrl: users.avatarUrl,
    isBookmarked,
  }
}

/**
 * The row shape `noteSelection()` produces. Written out explicitly rather
 * than inferred so that a schema change which alters a column's nullability
 * surfaces here as a type error instead of quietly reaching the UI.
 */
type NoteRow = {
  id: string
  slug: string
  title: string
  description: string | null
  subject: string
  category: string
  grade: string
  educationLevel: string
  course: string
  topic: string | null
  academicYear: string | null
  tags: string[]
  pageCount: number | null
  fileSizeBytes: number
  viewCount: number
  downloadCount: number
  sourceType: PublicNote["sourceType"]
  sourceUrl: string | null
  originalAuthor: string | null
  publishedAt: Date | null
  lastModifiedAt: Date
  contributorId: string
  contributorName: string
  contributorUsername: string
  contributorAvatarUrl: string | null
  isBookmarked: boolean
}

function toPublicNote(row: NoteRow): PublicNote {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    subject: row.subject,
    category: row.category,
    grade: row.grade,
    educationLevel: row.educationLevel,
    course: row.course,
    topic: row.topic,
    academicYear: row.academicYear,
    tags: row.tags ?? [],
    pageCount: row.pageCount,
    fileSizeBytes: row.fileSizeBytes,
    viewCount: row.viewCount,
    downloadCount: row.downloadCount,
    sourceType: row.sourceType,
    sourceUrl: row.sourceUrl,
    originalAuthor: row.originalAuthor,
    isBookmarked: row.isBookmarked,
    // A PUBLISHED note always has published_at set by the moderation
    // pipeline; the fallback exists only so the UI's non-nullable Date
    // contract can't be violated by unexpected data.
    publishedAt: row.publishedAt ?? new Date(),
    lastModifiedAt: row.lastModifiedAt ?? null,
    contributor: {
      id: row.contributorId,
      name: row.contributorName,
      username: row.contributorUsername,
      avatarUrl: row.contributorAvatarUrl,
    },
  }
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

/**
 * Splits the flat URL-shaped params into structural filters. `institution` is
 * deliberately dropped: there is no such column on `notes`, so honouring it
 * is impossible. (The previous ILIKE implementation had a dangling `if
 * (params.institution)` that accidentally made the `academicYear` filter
 * depend on it — silently ignoring academicYear on every normal request.)
 */
function toFilters(params: SearchNotesParams): SearchNotesFilters {
  return {
    subject: params.subject,
    grade: params.grade,
    educationLevel: params.educationLevel,
    topic: params.topic,
    academicYear: params.academicYear,
    contributorUsername: params.contributor,
    tags: params.tags,
  }
}

/**
 * Filters *narrow*; the query *ranks*. Everything here is an exact equality
 * or array containment so the planner can use plain indexes, and so a user
 * who ticks "Physics" never sees a Chemistry note no matter how well it
 * matches the text.
 */
function buildFilterConditions(filters: SearchNotesFilters): SQL[] {
  const conditions: SQL[] = [eq(notes.status, "PUBLISHED")]

  if (filters.subject) conditions.push(eq(notes.subject, filters.subject))
  if (filters.grade) conditions.push(eq(notes.grade, filters.grade))
  if (filters.educationLevel)
    conditions.push(eq(notes.educationLevel, filters.educationLevel))
  if (filters.topic) conditions.push(eq(notes.topic, filters.topic))
  if (filters.academicYear)
    conditions.push(eq(notes.academicYear, filters.academicYear))
  if (filters.course) conditions.push(eq(notes.course, filters.course))
  if (filters.contributorId)
    conditions.push(eq(notes.contributorId, filters.contributorId))
  if (filters.contributorUsername)
    conditions.push(eq(users.username, filters.contributorUsername))

  if (filters.tags && filters.tags.length > 0) {
    // `@>` (contains all) rather than `&&` (overlaps any): ticking a second
    // tag should narrow the result set, which is what users expect from a
    // filter. Uses notes_tags_gin_idx.
    conditions.push(
      sql`${notes.tags} @> ARRAY[${sql.join(
        filters.tags.map((t) => sql`${t}`),
        sql`, `
      )}]::text[]`
    )
  }

  return conditions
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

/**
 * Every sort ends with `notes.id` so pagination is deterministic. Without a
 * unique tiebreaker, rows with equal sort keys can appear on two pages or on
 * none as LIMIT/OFFSET walks the result set.
 */
function buildOrderBy(sort: SearchSort, scoreExpr: SQL<number> | null): SQL[] {
  switch (sort) {
    case "relevance":
      // Unreachable with a null score: resolveSort() downgrades `relevance`
      // to `newest` whenever there's no query to be relevant to.
      return scoreExpr
        ? [desc(scoreExpr), desc(notes.publishedAt), desc(notes.id)]
        : [desc(notes.publishedAt), desc(notes.id)]
    case "downloads":
      return [
        desc(notes.downloadCount),
        desc(notes.publishedAt),
        desc(notes.id),
      ]
    case "views":
      return [desc(notes.viewCount), desc(notes.publishedAt), desc(notes.id)]
    case "oldest":
      return [asc(notes.publishedAt), asc(notes.id)]
    case "newest":
    default:
      return [desc(notes.publishedAt), desc(notes.id)]
  }
}

/** `relevance` against an empty query is meaningless — fall back to recency. */
function resolveSort(
  requested: SearchNotesParams["sort"],
  hasQuery: boolean
): SearchSort {
  const sort = (requested ?? (hasQuery ? "relevance" : "newest")) as SearchSort
  if (sort === "relevance" && !hasQuery) return "newest"
  return sort
}

// ---------------------------------------------------------------------------
// The engine
// ---------------------------------------------------------------------------

export class PostgresNotesSearchIndex implements NotesSearchIndex {
  async search(params: SearchNotesParams): Promise<SearchNotesResult> {
    const rawQuery = params.q?.slice(0, SEARCH_CONFIG.maxQueryLength) ?? ""
    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.min(
      SEARCH_CONFIG.maxPageSize,
      Math.max(1, params.pageSize ?? SEARCH_CONFIG.defaultPageSize)
    )
    const offset = (page - 1) * pageSize

    // Parse first, then decide whether there's a query: a raw input of "???"
    // normalizes to "" and must be treated as browsing, not as a search that
    // returns nothing.
    let parsed: ParsedAcademicQuery | null = null
    if (rawQuery.trim()) {
      const knownSubjects = params.subject
        ? [params.subject]
        : await getKnownSubjects()
      parsed = parseAcademicQuery(rawQuery, {
        subjectResolver: createSubjectResolver(knownSubjects),
      })
      if (!parsed.normalized) parsed = null
    }
    const hasQuery = parsed !== null

    const filterConditions = buildFilterConditions(toFilters(params))
    const parsedConditions: SQL[] = []
    if (parsed?.subject)
      parsedConditions.push(eq(notes.subject, parsed.subject))
    if (parsed?.grade) parsedConditions.push(eq(notes.grade, parsed.grade))
    if (parsed?.educationLevel)
      parsedConditions.push(eq(notes.educationLevel, parsed.educationLevel))

    const conditions = [...filterConditions, ...parsedConditions]

    let scoreExpr: SQL<number> | null = null
    let trigram = false

    if (parsed) {
      trigram = await supportsTrigramSearch()
      const ranking = buildRankingExpressions(parsed, { trigram })
      scoreExpr = ranking.relevanceScore

      // Don't rank every published note against the query — require at least
      // one real signal. This is what lets Postgres use the GIN and trigram
      // indexes instead of computing ts_rank for the whole table, and it
      // keeps notes that score ~0 out of the results entirely rather than
      // ranked last (which would make "0 results" impossible and the result
      // count meaningless).
      const hasRemainingTerms =
        parsed.topicTerms.length > 0 || parsed.generalTerms.length > 0
      const signals: SQL[] = [ranking.fullTextMatch]
      if (ranking.fallbackMatch) signals.push(ranking.fallbackMatch)
      signals.push(ranking.exact.title, ranking.exact.topic, ranking.exact.tag)

      // Parsed fields already narrow the WHERE clause. They are standalone
      // match signals only for a purely structural query such as "physics" or
      // "class 12"; otherwise "physics ray optics" would return every Physics
      // note even when neither remaining topic word matched.
      if (!hasRemainingTerms) {
        signals.push(
          ranking.exact.subject,
          ranking.exact.grade,
          ranking.exact.educationLevel
        )
      }

      if (ranking.exact.contributor) signals.push(ranking.exact.contributor)

      const matchCondition = or(...signals)
      if (matchCondition) conditions.push(matchCondition)
    }

    const whereClause = and(...conditions)

    const orderBy = buildOrderBy(resolveSort(params.sort, hasQuery), scoreExpr)

    // Bookmark state is per-viewer, so it can't be cached with the rest of
    // the row. A correlated EXISTS is cheap here: bookmarks_note_idx makes it
    // an index probe per returned row, and only `pageSize` rows are returned.
    const user = await getCurrentUser()
    const isBookmarked: SQL<boolean> = user
      ? (exists(
          db
            .select({ one: sql`1` })
            .from(bookmarks)
            .where(
              and(eq(bookmarks.noteId, notes.id), eq(bookmarks.userId, user.id))
            )
        ) as SQL<boolean>)
      : sql<boolean>`false`

    const [rows, countRows] = await Promise.all([
      db
        .select(noteSelection(isBookmarked))
        .from(notes)
        .innerJoin(users, eq(notes.contributorId, users.id))
        .where(whereClause)
        .orderBy(...orderBy)
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(notes)
        .innerJoin(users, eq(notes.contributorId, users.id))
        .where(whereClause),
    ])

    let total = countRows[0]?.count ?? 0
    let publicNotes = rows.map((row) => toPublicNote(row))

    // Word-level typo correction is intentionally a fallback: use the indexed
    // full-text/trigram candidates first, then fill a short page from the small
    // published corpus only when those signals found nothing.
    if (
      parsed &&
      total === 0 &&
      rawQuery.trim().length >= SEARCH_CONFIG.minFuzzyLength &&
      trigram
    ) {
      const fuzzyCandidates = await db
        .select(noteSelection(isBookmarked))
        .from(notes)
        .innerJoin(users, eq(notes.contributorId, users.id))
        .where(and(...filterConditions, ...parsedConditions))
        .orderBy(desc(notes.downloadCount), desc(notes.id))
        .limit(500)

      const words = getSearchWords(parsed)
      const fuzzyMatches = fuzzyCandidates.map((row) => {
        const note = toPublicNote(row)
        const fields = [
          note.title,
          note.topic ?? "",
          note.subject,
          note.category ?? "",
          note.course ?? "",
          note.grade ?? "",
          note.educationLevel ?? "",
          note.contributor.name,
          note.contributor.username,
          ...(note.tags ?? []),
        ]
        const normalizedFields = fields.flatMap((field) =>
          normalizeSearchQuery(field).split(/\s+/).filter(Boolean)
        )
        const matched = words.filter((word) =>
          normalizedFields.some((candidate) =>
            isFuzzyWordMatch(word, candidate)
          )
        ).length
        const coverage = words.length > 0 ? matched / words.length : 0

        return coverage >= 0.75 ? { note, coverage } : null
      })
      const matchedTotal = fuzzyMatches.filter(Boolean).length
      total = matchedTotal

      publicNotes = fuzzyMatches
        .filter((match): match is { note: PublicNote; coverage: number } =>
          Boolean(match)
        )
        .sort((a, b) => b.coverage - a.coverage)
        .slice(offset, offset + pageSize)
        .map(({ note }) => note)
    }

    return {
      notes: publicNotes,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  }

  /**
   * Autocomplete over normalized metadata. Prefixes are preferred; typo
   * suggestions fill the remaining slots only when they clear a stricter
   * similarity floor. Results come from one SQL query rather than three
   * independent connection round trips.
   */
  async suggest(query: string): Promise<NoteSuggestion[]> {
    const normalized = normalizeSearchQuery(query)
    if (normalized.length < SEARCH_CONFIG.minSuggestLength) return []

    const escaped = normalized.replace(/([\\%_])/g, "\\$1")
    const prefix = `${escaped}%`
    const wordPrefix = `% ${escaped}%`
    const perKind = SEARCH_CONFIG.maxSuggestionsPerKind

    const result = await db.execute<{
      kind: NoteSuggestion["kind"]
      label: string
      slug?: string
      prefix_match: boolean
      score: number
    }>(sql`
      WITH candidates AS (
        SELECT 'subject'::text AS kind, subject AS label, NULL::text AS slug, true AS prefix_match, 1::float AS score
        FROM notes WHERE status = 'PUBLISHED'
          AND (
            notes_normalize_search_text(subject) LIKE ${prefix}
            OR notes_normalize_search_text(subject) LIKE ${wordPrefix}
          )
        UNION ALL
        SELECT 'topic', topic, NULL::text, true, 1::float
        FROM notes WHERE status = 'PUBLISHED' AND topic IS NOT NULL
          AND (
            notes_normalize_search_text(coalesce(topic, '')) LIKE ${prefix}
            OR notes_normalize_search_text(coalesce(topic, '')) LIKE ${wordPrefix}
          )
        UNION ALL
        SELECT 'title', title, slug, true, 1::float
        FROM notes WHERE status = 'PUBLISHED'
          AND (
            notes_normalize_search_text(title) LIKE ${prefix}
            OR notes_normalize_search_text(title) LIKE ${wordPrefix}
          )
        UNION ALL
        SELECT 'subject', subject, NULL::text, false,
               similarity(notes_normalize_search_text(subject), ${normalized})
        FROM notes WHERE status = 'PUBLISHED'
          AND notes_normalize_search_text(subject) NOT LIKE ${prefix}
          AND notes_normalize_search_text(subject) NOT LIKE ${wordPrefix}
          AND similarity(notes_normalize_search_text(subject), ${normalized}) >= ${SEARCH_CONFIG.prefixTrigramThreshold}
        UNION ALL
        SELECT 'topic', topic, NULL::text, false,
               similarity(notes_normalize_search_text(coalesce(topic, '')), ${normalized})
        FROM notes WHERE status = 'PUBLISHED' AND topic IS NOT NULL
          AND notes_normalize_search_text(coalesce(topic, '')) NOT LIKE ${prefix}
          AND notes_normalize_search_text(coalesce(topic, '')) NOT LIKE ${wordPrefix}
          AND similarity(notes_normalize_search_text(coalesce(topic, '')), ${normalized}) >= ${SEARCH_CONFIG.prefixTrigramThreshold}
        UNION ALL
        SELECT 'title', title, slug, false,
               similarity(notes_normalize_search_text(title), ${normalized})
        FROM notes WHERE status = 'PUBLISHED'
          AND notes_normalize_search_text(title) NOT LIKE ${prefix}
          AND notes_normalize_search_text(title) NOT LIKE ${wordPrefix}
          AND similarity(notes_normalize_search_text(title), ${normalized}) >= ${SEARCH_CONFIG.prefixTrigramThreshold}
      ), ranked AS (
        SELECT kind, label, slug, prefix_match, score,
               row_number() OVER (
                 PARTITION BY kind, lower(label)
                 ORDER BY prefix_match DESC, score DESC, label
               ) AS duplicate_rank
        FROM candidates
      )
      SELECT kind, label, slug, prefix_match, score
      FROM (
        SELECT *, count(*) OVER (PARTITION BY kind) AS kind_count,
               row_number() OVER (
                 PARTITION BY kind ORDER BY prefix_match DESC, score DESC, label
               ) AS kind_rank
        FROM ranked
        WHERE duplicate_rank = 1
      ) ranked_unique
      WHERE kind_rank <= ${perKind}
      ORDER BY prefix_match DESC, score DESC, kind_count ASC, label
      LIMIT ${SEARCH_CONFIG.maxSuggestions}
    `)

    return result.rows.map((row) => ({
      kind: row.kind,
      label: row.label,
      ...(row.slug ? { slug: row.slug } : {}),
    }))
  }
}
