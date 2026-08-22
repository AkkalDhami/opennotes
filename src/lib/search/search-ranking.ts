import { sql, type SQL } from "drizzle-orm"

import { notes, users } from "@/db"

import { SEARCH_CONFIG, SEARCH_WEIGHTS } from "./search-constants"
import type { ParsedAcademicQuery } from "./search-types"

/**
 * Builds a `websearch_to_tsquery` fragment against the `simple` text search
 * configuration (§9) — chosen deliberately over `english` because OpenNotes
 * content is full of proper nouns, abbreviations (BCA, DBMS), and mixed
 * academic vocabulary that aggressive English stemming would mangle.
 * `websearch_to_tsquery` (rather than plain `to_tsquery`) gives us
 * phrase-aware, typo-tolerant-of-syntax parsing for free — quoted phrases,
 * `-exclude`, `or`, etc. all work the way a search box user expects.
 */
export function buildTsQuery(normalizedQuery: string): SQL {
  return sql`websearch_to_tsquery('simple', ${normalizedQuery})`
}

/**
 * The combined phrase used for exact/substring matching — the parsed
 * topic/general terms rejoined, since those are what's left after grade/
 * subject/education-level have already been "claimed" by structured
 * metadata matching. Falls back to the full normalized query when nothing
 * was classified as topic/general (e.g. a bare "physics" query).
 */
function getMatchPhrase(parsed: ParsedAcademicQuery): string {
  const terms = [...parsed.topicTerms, ...parsed.generalTerms]
  return terms.length > 0 ? terms.join(" ") : parsed.normalized
}

export interface RankingExpressions {
  /** The parsed tsquery, reused for both ts_rank and plan-level filtering. */
  tsQuery: SQL
  /** Raw ts_rank(search_vector, tsquery) — 0 when the query is empty. */
  fullTextRank: SQL<number>
  /** Best of title/topic trigram similarity — the fuzzy fallback signal. */
  trigramSimilarity: SQL<number>
  exact: {
    title: SQL<boolean>
    topic: SQL<boolean>
    subject: SQL<boolean>
    grade: SQL<boolean>
    educationLevel: SQL<boolean>
    tag: SQL<boolean>
    contributor: SQL<boolean>
  }
  /** log(1 + downloadCount) — never raw download count (§18). */
  popularityScore: SQL<number>
  /** Linear decay over a configurable window, floored at 0 (§19). */
  freshnessScore: SQL<number>
  /** The single combined score every result is ordered by for `sort=relevance`. */
  relevanceScore: SQL<number>
}

/**
 * Builds every SQL expression needed to rank notes against a parsed
 * academic query. Pure expression-building — no querying, no joins, no
 * pagination. `postgres-notes-search.ts` is responsible for wiring these
 * into an actual `select()`.
 */
export function buildRankingExpressions(
  parsed: ParsedAcademicQuery,
  hasQuery: boolean
): RankingExpressions {
  const tsQuery = buildTsQuery(parsed.normalized || " ")
  const phrase = getMatchPhrase(parsed)
  const phraseIsUsable = phrase.length > 0

  const fullTextRank = hasQuery
    ? sql<number>`ts_rank(${notes.searchVector}, ${tsQuery})`
    : sql<number>`0`

  // similarity() is pg_trgm's fuzzy-match function — used as a fallback
  // signal only (§13), never the primary ranking mechanism. Short queries
  // are excluded (SEARCH_CONFIG.minFuzzyLength) since trigram similarity on
  // very short strings is noisy.
  const trigramSimilarity =
    hasQuery && phrase.length >= SEARCH_CONFIG.minFuzzyLength
      ? sql<number>`GREATEST(
          similarity(lower(${notes.title}), lower(${phrase})),
          similarity(lower(coalesce(${notes.topic}, '')), lower(${phrase}))
        )`
      : sql<number>`0`

  const exact = {
    title: phraseIsUsable
      ? sql<boolean>`lower(${notes.title}) = lower(${phrase})`
      : sql<boolean>`false`,
    topic: phraseIsUsable
      ? sql<boolean>`lower(coalesce(${notes.topic}, '')) = lower(${phrase})`
      : sql<boolean>`false`,
    subject: parsed.subject
      ? sql<boolean>`lower(${notes.subject}) = lower(${parsed.subject})`
      : sql<boolean>`false`,
    grade: parsed.grade
      ? sql<boolean>`lower(${notes.grade}) = lower(${parsed.grade})`
      : sql<boolean>`false`,
    educationLevel: parsed.educationLevel
      ? sql<boolean>`lower(${notes.educationLevel}) = lower(${parsed.educationLevel})`
      : sql<boolean>`false`,
    tag:
      parsed.tokens.length > 0
        ? sql<boolean>`${notes.tags} && ARRAY[${sql.join(
            parsed.tokens.map((t) => sql`${t}`),
            sql`, `
          )}]::text[]`
        : sql<boolean>`false`,
    contributor: phraseIsUsable
      ? sql<boolean>`(lower(${users.name}) ILIKE ${"%" + phrase + "%"} OR lower(${users.username}) ILIKE ${"%" + phrase + "%"})`
      : sql<boolean>`false`,
  }

  const popularityScore = sql<number>`ln(1 + ${notes.downloadCount}) * ${SEARCH_WEIGHTS.popularity}`

  const freshnessWindowDays = 90
  const freshnessScore = sql<number>`GREATEST(
      0,
      1 - (EXTRACT(EPOCH FROM (now() - coalesce(${notes.publishedAt}, ${notes.createdAt}))) / ${60 * 60 * 24 * freshnessWindowDays})
    ) * ${SEARCH_WEIGHTS.freshness}`

  const relevanceScore = sql<number>`(
      (${fullTextRank} * ${SEARCH_WEIGHTS.titleFullText})
      + (CASE WHEN ${exact.title} THEN ${SEARCH_WEIGHTS.titleExact} ELSE 0 END)
      + (CASE WHEN ${exact.topic} THEN ${SEARCH_WEIGHTS.topicExact} ELSE 0 END)
      + (CASE WHEN ${exact.subject} THEN ${SEARCH_WEIGHTS.subjectExact} ELSE 0 END)
      + (CASE WHEN ${exact.grade} THEN ${SEARCH_WEIGHTS.gradeExact} ELSE 0 END)
      + (CASE WHEN ${exact.educationLevel} THEN ${SEARCH_WEIGHTS.educationLevelExact} ELSE 0 END)
      + (CASE WHEN ${exact.tag} THEN ${SEARCH_WEIGHTS.tagMatch} ELSE 0 END)
      + (CASE WHEN ${exact.contributor} THEN ${SEARCH_WEIGHTS.contributorMatch} ELSE 0 END)
      + (${trigramSimilarity} * ${SEARCH_WEIGHTS.fuzzyTitle})
      + ${popularityScore}
      + ${freshnessScore}
    )`

  return {
    tsQuery,
    fullTextRank,
    trigramSimilarity,
    exact,
    popularityScore,
    freshnessScore,
    relevanceScore,
  }
}
