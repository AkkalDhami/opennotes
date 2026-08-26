import { and, asc, desc, eq, exists, or, sql, type SQL } from "drizzle-orm"

import { bookmarks, db, notes, users } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"

import { SEARCH_CONFIG } from "./search-constants"
import type { NotesSearchIndex } from "./notes-search"
import { createSubjectResolver, parseAcademicQuery } from "./search-parser"
import { buildRankingExpressions } from "./search-ranking"
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
    grade: notes.grade,
    educationLevel: notes.educationLevel,
    course: notes.course,
    topic: notes.topic,
    academicYear: notes.academicYear,
    tags: notes.tags,
    pageCount: notes.pageCount,
    fileSizeBytes: notes.fileSizeBytes,
    filePath: notes.filePath,
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
  grade: string
  educationLevel: string
  course: string
  topic: string | null
  academicYear: string | null
  tags: string[] | null
  pageCount: number | null
  fileSizeBytes: number
  filePath: string
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
    grade: row.grade,
    educationLevel: row.educationLevel,
    course: row.course,
    topic: row.topic,
    academicYear: row.academicYear,
    tags: row.tags ?? [],
    pageCount: row.pageCount,
    fileSizeBytes: row.fileSizeBytes,
    filePath: row.filePath,
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
    if (params.q && params.q.trim()) {
      const knownSubjects = await getKnownSubjects()
      parsed = parseAcademicQuery(params.q, {
        subjectResolver: createSubjectResolver(knownSubjects),
      })
      if (!parsed.normalized) parsed = null
    }
    const hasQuery = parsed !== null

    const conditions = buildFilterConditions(toFilters(params))

    let scoreExpr: SQL<number> | null = null

    if (parsed) {
      const ranking = buildRankingExpressions(parsed)
      scoreExpr = ranking.relevanceScore

      // Don't rank every published note against the query — require at least
      // one real signal. This is what lets Postgres use the GIN and trigram
      // indexes instead of computing ts_rank for the whole table, and it
      // keeps notes that score ~0 out of the results entirely rather than
      // ranked last (which would make "0 results" impossible and the result
      // count meaningless).
      const signals: SQL[] = [ranking.fullTextMatch]
      if (ranking.trigramMatch) signals.push(ranking.trigramMatch)
      signals.push(
        ranking.exact.title,
        ranking.exact.topic,
        ranking.exact.subject,
        ranking.exact.grade,
        ranking.exact.tag
      )
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

    const total = countRows[0]?.count ?? 0

    return {
      notes: rows.map((row) => toPublicNote(row)),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  }

  /**
   * Autocomplete. Prefix matching (`lower(col) LIKE 'foo%'`) rather than
   * ranked full-text: while someone is still typing, "elec" isn't a word yet,
   * so a tsquery for it matches nothing. The trigram indexes on
   * lower(title)/lower(topic)/lower(subject) serve these leading-anchored
   * LIKEs, which a btree index could also do — but the trigram indexes are
   * already there for the fuzzy fallback.
   *
   * Returns labels only. Picking a suggestion runs a normal search for that
   * text; it never navigates straight to a note, so this stays a search-box
   * aid rather than a second, subtly different results path.
   */
  async suggest(query: string): Promise<NoteSuggestion[]> {
    const normalized = query.trim().toLowerCase()
    if (normalized.length < SEARCH_CONFIG.minSuggestLength) return []

    // Escape LIKE metacharacters so a user typing "100%" or "a_b" doesn't
    // turn their own input into a wildcard pattern.
    const escaped = normalized.replace(/([\\%_])/g, "\\$1")
    const prefix = `${escaped}%`
    const perKind = SEARCH_CONFIG.maxSuggestionsPerKind

    const published = eq(notes.status, "PUBLISHED")

    const [subjectRows, topicRows, titleRows] = await Promise.all([
      db
        .selectDistinct({ value: notes.subject })
        .from(notes)
        .where(and(published, sql`lower(${notes.subject}) LIKE ${prefix}`))
        .limit(perKind),
      db
        .selectDistinct({ value: notes.topic })
        .from(notes)
        .where(
          and(
            published,
            sql`${notes.topic} IS NOT NULL`,
            sql`lower(${notes.topic}) LIKE ${prefix}`
          )
        )
        .limit(perKind),
      // Titles are ordered by downloads so the most useful completion wins;
      // subjects/topics are DISTINCT sets where ordering carries no meaning.
      db
        .select({ value: notes.title })
        .from(notes)
        .where(and(published, sql`lower(${notes.title}) LIKE ${prefix}`))
        .orderBy(desc(notes.downloadCount), desc(notes.id))
        .limit(perKind),
    ])

    const suggestions: NoteSuggestion[] = [
      ...subjectRows.map((r) => ({ label: r.value, kind: "subject" as const })),
      ...topicRows
        .filter((r): r is { value: string } => Boolean(r.value))
        .map((r) => ({ label: r.value, kind: "topic" as const })),
      ...titleRows.map((r) => ({ label: r.value, kind: "title" as const })),
    ]

    const seen = new Set<string>()
    return suggestions
      .filter((s) => {
        const key = s.label.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, SEARCH_CONFIG.maxSuggestions)
  }
}
