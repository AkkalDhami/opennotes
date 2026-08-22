import { and, asc, desc, eq, or, sql, SQL } from "drizzle-orm"

import { db } from "@/db"
import { notes, users } from "@/db"

import { SEARCH_CONFIG } from "./search-constants"
import { createSubjectResolver } from "./search-parser"
import { buildRankingExpressions } from "./search-ranking"
import { NotesSearchIndex } from "./notes-search"
import { parseAcademicQuery } from "./search-parser"
import {
  NoteSuggestion,
  ParsedAcademicQuery,
  PublicNote,
  SearchNotesFilters,
  SearchNotesParams,
  SearchNotesResult,
  SearchResultItem,
} from "./search-types"

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

  const subjects = rows.map((r) => r.subject)
  knownSubjectsCache = {
    subjects,
    expiresAt: Date.now() + KNOWN_SUBJECTS_TTL_MS,
  }
  return subjects
}

function deriveFileType(originalFileName: string | null): string | null {
  if (!originalFileName) return null
  const ext = originalFileName.split(".").pop()
  return ext ? ext.toUpperCase() : null
}

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
  originalFileName: string | null
  pageCount: number | null
  fileSizeBytes: number
  downloadCount: number
  originalAuthor: string | null
  sourceType: PublicNote["sourceType"]
  sourceUrl: string | null
  publishedAt: Date | null
  contributorId: string
  contributorName: string
  contributorUsername: string
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
    fileType: deriveFileType(row.originalFileName),
    pageCount: row.pageCount,
    fileSizeBytes: row.fileSizeBytes,
    downloadCount: row.downloadCount,
    originalAuthor: row.originalAuthor,
    sourceType: row.sourceType,
    sourceUrl: row.sourceUrl,
    publishedAt: row.publishedAt,
    contributor: {
      id: row.contributorId,
      name: row.contributorName,
      username: row.contributorUsername,
    },
  }
}

const NOTE_SELECT_COLUMNS = {
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
  originalFileName: notes.originalFileName,
  pageCount: notes.pageCount,
  fileSizeBytes: notes.fileSizeBytes,
  downloadCount: notes.downloadCount,
  originalAuthor: notes.originalAuthor,
  sourceType: notes.sourceType,
  sourceUrl: notes.sourceUrl,
  publishedAt: notes.publishedAt,
  contributorId: users.id,
  contributorName: users.name,
  contributorUsername: users.username,
} as const

function buildFilterConditions(filters: SearchNotesFilters | undefined): SQL[] {
  const conditions: SQL[] = [eq(notes.status, "PUBLISHED")]

  if (!filters) return conditions

  if (filters.subject) {
    conditions.push(eq(notes.subject, filters.subject))
  }

  if (filters.grade) {
    conditions.push(eq(notes.grade, filters.grade))
  }

  if (filters.educationLevel) {
    conditions.push(eq(notes.educationLevel, filters.educationLevel))
  }

  if (filters.topic) {
    conditions.push(eq(notes.topic, filters.topic))
  }

  if (filters.academicYear) {
    conditions.push(eq(notes.academicYear, filters.academicYear))
  }

  if (filters.course) {
    conditions.push(eq(notes.course, filters.course))
  }

  if (filters.contributorId) {
    conditions.push(eq(notes.contributorId, filters.contributorId))
  }

  if (filters.tags && filters.tags.length > 0) {
    conditions.push(
      sql`${notes.tags} && ARRAY[${sql.join(
        filters.tags.map((t) => sql`${t}`),
        sql`, `
      )}]::text[]`
    )
  }

  return conditions
}

// ---------------------------------------------------------------------------
// The implementation
// ---------------------------------------------------------------------------

export class PostgresNotesSearchIndex implements NotesSearchIndex {
  async search(params: SearchNotesParams): Promise<SearchNotesResult> {
    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.min(
      SEARCH_CONFIG.maxPageSize,
      Math.max(1, params.pageSize ?? SEARCH_CONFIG.defaultPageSize)
    )
    const offset = (page - 1) * pageSize

    const rawQuery = (params.query ?? "").trim()
    const hasQuery = rawQuery.length > 0

    // §27: an empty query is a discovery page, not a meaningless full-text
    // search — skip parsing/ranking entirely and just apply filters + sort.
    let parsed: ParsedAcademicQuery | null = null
    if (hasQuery) {
      const knownSubjects = await getKnownSubjects()
      parsed = parseAcademicQuery(rawQuery, {
        subjectResolver: createSubjectResolver(knownSubjects),
      })
    }

    const filterConditions = buildFilterConditions(params.filters)

    // §20: `relevance` with no query falls back to a sensible default
    // rather than computing meaningless relevance against nothing.
    const effectiveSort =
      !hasQuery && (params.sort ?? "relevance") === "relevance"
        ? "newest"
        : (params.sort ?? "relevance")

    let scoreExpr: SQL<number> | null = null
    let matchCondition: SQL | undefined

    if (hasQuery && parsed) {
      const ranking = buildRankingExpressions(parsed, true)
      scoreExpr = ranking.relevanceScore

      // Don't rank EVERY published note against the query — only ones with
      // at least one real signal (full-text hit, fuzzy similarity above
      // threshold, or an exact structured-metadata match). This keeps the
      // query fast (Postgres can use the GIN/trigram indexes to satisfy
      // this condition) and keeps completely unrelated notes with a score
      // of ~0 out of the result set entirely, rather than ranked last.
      matchCondition = or(
        sql`${notes.searchVector} @@ ${ranking.tsQuery}`,
        sql`${ranking.trigramSimilarity} > ${SEARCH_CONFIG.trigramThreshold}`,
        ranking.exact.title,
        ranking.exact.topic,
        ranking.exact.subject,
        ranking.exact.grade,
        ranking.exact.tag,
        ranking.exact.contributor
      )
    }

    const whereClause = and(
      ...filterConditions,
      ...(matchCondition ? [matchCondition] : [])
    )

    const orderBy = this.buildOrderBy(effectiveSort, scoreExpr)

    const baseQuery = db
      .select(
        scoreExpr
          ? { ...NOTE_SELECT_COLUMNS, score: scoreExpr }
          : NOTE_SELECT_COLUMNS
      )
      .from(notes)
      .innerJoin(users, eq(notes.contributorId, users.id))
      .where(whereClause)

    const countQuery = db
      .select({ value: sql<number>`count(*)` })
      .from(notes)
      .innerJoin(users, eq(notes.contributorId, users.id))
      .where(whereClause)

    const [rows, countRows] = await Promise.all([
      baseQuery
        .orderBy(...orderBy)
        .limit(pageSize)
        .offset(offset),
      countQuery,
    ])

    const total = Number(countRows[0]?.value ?? 0)
    const items: SearchResultItem[] = rows.map((row) => ({
      note: toPublicNote(row),
    }))

    let didYouMean: string | undefined
    if (total === 0 && hasQuery && parsed) {
      didYouMean = await this.findDidYouMean(parsed.normalized)
    }

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      didYouMean,
    }
  }

  async suggest(query: string): Promise<NoteSuggestion[]> {
    const normalized = query.trim().toLowerCase()
    if (normalized.length < 2) return []

    const like = `${normalized}%`

    const [subjectRows, topicRows, titleRows] = await Promise.all([
      db
        .selectDistinct({ value: notes.subject })
        .from(notes)
        .where(
          and(
            eq(notes.status, "PUBLISHED"),
            sql`lower(${notes.subject}) LIKE ${like}`
          )
        )
        .limit(4),
      db
        .selectDistinct({ value: notes.topic })
        .from(notes)
        .where(
          and(
            eq(notes.status, "PUBLISHED"),
            sql`${notes.topic} IS NOT NULL AND lower(${notes.topic}) LIKE ${like}`
          )
        )
        .limit(4),
      db
        .select({ value: notes.title })
        .from(notes)
        .where(
          and(
            eq(notes.status, "PUBLISHED"),
            sql`lower(${notes.title}) LIKE ${like}`
          )
        )
        .orderBy(desc(notes.downloadCount))
        .limit(4),
    ])

    const suggestions: NoteSuggestion[] = [
      ...subjectRows.map((r) => ({ label: r.value, kind: "subject" as const })),
      ...topicRows
        .filter((r) => r.value)
        .map((r) => ({ label: r.value as string, kind: "topic" as const })),
      ...titleRows.map((r) => ({ label: r.value, kind: "title" as const })),
    ]

    // De-dupe by label, cap the total so this stays cheap and the dropdown
    // stays scannable.
    const seen = new Set<string>()
    return suggestions
      .filter((s) => {
        const key = s.label.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 8)
  }

  private buildOrderBy(
    sort: SearchNotesParams["sort"] | "newest",
    scoreExpr: SQL<number> | null
  ): SQL[] {
    switch (sort) {
      case "relevance":
        // Only reachable when hasQuery is true (see effectiveSort above),
        // so scoreExpr is guaranteed non-null here.
        return [desc(scoreExpr!), desc(notes.publishedAt)]
      case "downloads":
        return [desc(notes.downloadCount), desc(notes.publishedAt)]
      case "views":
        // ⚠️ NOTE: the `views` table is commented out in the schema you
        // shared, so there's no real view-count column to sort by yet.
        // Falls back to downloads rather than erroring on a sort option
        // the public API contract promises. Swap this for a real
        // `notes.viewCount` (or a join against `views`) once that table
        // exists.
        return [desc(notes.downloadCount), desc(notes.publishedAt)]
      case "oldest":
        return [asc(notes.publishedAt)]
      case "newest":
      default:
        return [desc(notes.publishedAt)]
    }
  }

  /**
   * §28 — simple trigram-based "did you mean" for zero-result searches.
   * Deliberately not a general spelling-correction system: just "what
   * published note title is closest to what they typed."
   */
  private async findDidYouMean(
    normalizedQuery: string
  ): Promise<string | undefined> {
    const rows = await db
      .select({
        title: notes.title,
        similarity: sql<number>`similarity(lower(${notes.title}), lower(${normalizedQuery}))`,
      })
      .from(notes)
      .where(eq(notes.status, "PUBLISHED"))
      .orderBy(
        desc(sql`similarity(lower(${notes.title}), lower(${normalizedQuery}))`)
      )
      .limit(1)

    const best = rows[0]
    if (best && best.similarity >= SEARCH_CONFIG.didYouMeanThreshold) {
      return best.title
    }
    return undefined
  }
}
