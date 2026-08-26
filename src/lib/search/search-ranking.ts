import { sql, type SQL } from "drizzle-orm"

import { notes, users } from "@/db"

import { SEARCH_CONFIG, SEARCH_WEIGHTS } from "./search-constants"
import type { ParsedAcademicQuery } from "./search-types"

/**
 * Builds a `websearch_to_tsquery` fragment against the `simple` text search
 * configuration — chosen deliberately over `english` because OpenNotes
 * content is full of proper nouns, abbreviations (BCA, DBMS, SEE, C++) and
 * mixed academic vocabulary that aggressive English stemming would mangle.
 * `websearch_to_tsquery` (rather than plain `to_tsquery`) never throws on
 * malformed input, and gives quoted phrases, `-exclude` and `or` for free.
 *
 * MUST stay in sync with the configuration used by
 * `notes_build_search_vector()` in src/db/sql/notes-search.sql. A query
 * parsed with 'simple' against a vector built with 'english' matches almost
 * nothing, and fails silently.
 */
export function buildTsQuery(normalizedQuery: string): SQL {
  return sql`websearch_to_tsquery('simple', ${normalizedQuery})`
}

/**
 * The phrase used for fuzzy and exact matching: the parsed topic/general
 * terms rejoined, since those are what's left once grade/subject/education
 * level have been claimed by structured metadata matching. Falls back to the
 * whole normalized query when nothing was left over (e.g. a bare "physics").
 */
function getMatchPhrase(parsed: ParsedAcademicQuery): string {
  const terms = [...parsed.topicTerms, ...parsed.generalTerms]
  return terms.length > 0 ? terms.join(" ") : parsed.normalized
}

export interface RankingExpressions {
  /** The parsed tsquery, reused for both ts_rank and the WHERE clause. */
  tsQuery: SQL
  /** `search_vector @@ tsquery` — the primary, index-driven match. */
  fullTextMatch: SQL<boolean>
  /** Raw ts_rank(search_vector, tsquery), 0 when there's no query. */
  fullTextRank: SQL<number>
  /**
   * Index-usable trigram predicate for the typo-tolerant fallback, or `null`
   * when the query is too short for trigrams to be meaningful.
   *
   * See the note on `%` vs `similarity()` in buildRankingExpressions.
   */
  trigramMatch: SQL<boolean> | null
  /** Best-of title/topic/subject trigram similarity — the fuzzy score. */
  trigramSimilarity: SQL<number>
  exact: {
    title: SQL<boolean>
    topic: SQL<boolean>
    subject: SQL<boolean>
    grade: SQL<boolean>
    educationLevel: SQL<boolean>
    tag: SQL<boolean>
    /** `null` when contributor matching doesn't apply to this query. */
    contributor: SQL<boolean> | null
  }
  /** ln(1 + downloadCount) — never the raw count. */
  popularityScore: SQL<number>
  /** Linear decay over a fixed window, floored at 0. */
  freshnessScore: SQL<number>
  /** The combined score every result is ordered by for `sort=relevance`. */
  relevanceScore: SQL<number>
}

const FRESHNESS_WINDOW_DAYS = 90
const FRESHNESS_WINDOW_SECONDS = 60 * 60 * 24 * FRESHNESS_WINDOW_DAYS

/**
 * Builds every SQL expression needed to match and rank notes against a
 * parsed academic query. Pure expression building — no querying, no joins,
 * no pagination. `postgres-notes-search.ts` wires these into a real select.
 */
export function buildRankingExpressions(
  parsed: ParsedAcademicQuery
): RankingExpressions {
  // websearch_to_tsquery('simple', '') is a valid empty query that matches
  // nothing, which is the correct behaviour — but callers should not be
  // building ranking expressions for an empty query in the first place.
  const tsQuery = buildTsQuery(parsed.normalized)
  const phrase = getMatchPhrase(parsed)
  const phraseIsUsable = phrase.length > 0

  const fullTextMatch = sql<boolean>`${notes.searchVector} @@ ${tsQuery}`
  const fullTextRank = sql<number>`ts_rank(${notes.searchVector}, ${tsQuery})`

  // -------------------------------------------------------------------------
  // Fuzzy fallback
  // -------------------------------------------------------------------------
  // Two different pg_trgm constructs, for two different jobs:
  //
  //   `%`            — an *operator*, so the planner can satisfy it from
  //                    notes_title_trgm_idx et al. This is the only form
  //                    that uses a trigram index.
  //   `similarity()` — a *function*, which can never use a trigram index and
  //                    would force a sequential scan if used as the filter.
  //
  // So: filter with `%` (fast, index-driven, threshold comes from the
  // server's pg_trgm.similarity_threshold GUC), then re-check similarity()
  // on the already-narrowed rows so SEARCH_CONFIG.trigramThreshold remains
  // the authoritative floor regardless of the GUC. similarity() is also what
  // feeds the score.
  //
  // CRITICAL: the left-hand expressions below must match the indexed
  // expressions in src/db/sql/notes-search.sql character for character
  // (`lower(title)`, `lower(coalesce(topic, ''))`, `lower(subject)`). Change
  // one without the other and the index is silently ignored — the query
  // still returns correct results, just via a full scan.
  const titleSim = sql<number>`similarity(lower(${notes.title}), ${phrase})`
  const topicSim = sql<number>`similarity(lower(coalesce(${notes.topic}, '')), ${phrase})`
  const subjectSim = sql<number>`similarity(lower(${notes.subject}), ${phrase})`

  const fuzzyEligible =
    phraseIsUsable && phrase.length >= SEARCH_CONFIG.minFuzzyLength

  const trigramSimilarity = fuzzyEligible
    ? sql<number>`GREATEST(${titleSim}, ${topicSim}, ${subjectSim})`
    : sql<number>`0`

  const trigramMatch = fuzzyEligible
    ? sql<boolean>`(
        (lower(${notes.title}) % ${phrase} AND ${titleSim} >= ${SEARCH_CONFIG.trigramThreshold})
        OR (lower(coalesce(${notes.topic}, '')) % ${phrase} AND ${topicSim} >= ${SEARCH_CONFIG.trigramThreshold})
        OR (lower(${notes.subject}) % ${phrase} AND ${subjectSim} >= ${SEARCH_CONFIG.trigramThreshold})
      )`
    : null

  // -------------------------------------------------------------------------
  // Exact structured matches
  // -------------------------------------------------------------------------
  // These are ranking boosts, not filters. `parsed.subject` etc. are already
  // canonical ids ("computer-science", "grade-12") because the alias tables
  // in search-constants.ts are derived from the same constants the upload
  // form writes, so these compare like-for-like with the stored values.
  const exact = {
    title: phraseIsUsable
      ? sql<boolean>`lower(${notes.title}) = ${phrase}`
      : sql<boolean>`false`,
    topic: phraseIsUsable
      ? sql<boolean>`lower(coalesce(${notes.topic}, '')) = ${phrase}`
      : sql<boolean>`false`,
    subject: parsed.subject
      ? sql<boolean>`lower(${notes.subject}) = ${parsed.subject}`
      : sql<boolean>`false`,
    grade: parsed.grade
      ? sql<boolean>`lower(${notes.grade}) = ${parsed.grade}`
      : sql<boolean>`false`,
    educationLevel: parsed.educationLevel
      ? sql<boolean>`lower(${notes.educationLevel}) = ${parsed.educationLevel}`
      : sql<boolean>`false`,
    tag:
      parsed.tokens.length > 0
        ? sql<boolean>`${notes.tags} && ARRAY[${sql.join(
            parsed.tokens.map((t) => sql`${t}`),
            sql`, `
          )}]::text[]`
        : sql<boolean>`false`,

    // Contributor matching only applies when the parser recognised *no*
    // academic metadata — i.e. the query looks like a name or a bare title,
    // not a subject/grade lookup. "class 12 physics ray optics" is never
    // somebody's username, and matching it against users would only add an
    // unindexable `ILIKE '%…%'` to the hot path for no benefit.
    contributor:
      phraseIsUsable && parsed.generalTerms.length > 0
        ? sql<boolean>`(${users.name} ILIKE ${"%" + phrase + "%"} OR ${users.username} ILIKE ${"%" + phrase + "%"})`
        : null,
  }

  const contributorMatch = exact.contributor ?? sql<boolean>`false`

  // -------------------------------------------------------------------------
  // Non-relevance signals
  // -------------------------------------------------------------------------
  // ln(1 + n) rather than n: a note with 10,000 downloads is better than one
  // with 100, but not 100× better, and raw counts would let popularity
  // completely drown out textual relevance.
  const popularityScore = sql<number>`ln(1 + ${notes.downloadCount}) * ${SEARCH_WEIGHTS.popularity}`

  // Linear decay to zero over the window, then flat — an old-but-perfect
  // match should never be pushed below a fresh-but-irrelevant one, so this
  // is a small additive nudge, not a multiplier.
  const freshnessScore = sql<number>`GREATEST(
      0,
      1 - (EXTRACT(EPOCH FROM (now() - coalesce(${notes.publishedAt}, ${notes.createdAt}))) / ${FRESHNESS_WINDOW_SECONDS})
    ) * ${SEARCH_WEIGHTS.freshness}`

  const relevanceScore = sql<number>`(
      (${fullTextRank} * ${SEARCH_WEIGHTS.titleFullText})
      + (CASE WHEN ${exact.title} THEN ${SEARCH_WEIGHTS.titleExact} ELSE 0 END)
      + (CASE WHEN ${exact.topic} THEN ${SEARCH_WEIGHTS.topicExact} ELSE 0 END)
      + (CASE WHEN ${exact.subject} THEN ${SEARCH_WEIGHTS.subjectExact} ELSE 0 END)
      + (CASE WHEN ${exact.grade} THEN ${SEARCH_WEIGHTS.gradeExact} ELSE 0 END)
      + (CASE WHEN ${exact.educationLevel} THEN ${SEARCH_WEIGHTS.educationLevelExact} ELSE 0 END)
      + (CASE WHEN ${exact.tag} THEN ${SEARCH_WEIGHTS.tagMatch} ELSE 0 END)
      + (CASE WHEN ${contributorMatch} THEN ${SEARCH_WEIGHTS.contributorMatch} ELSE 0 END)
      + (${trigramSimilarity} * ${SEARCH_WEIGHTS.fuzzyTitle})
      + ${popularityScore}
      + ${freshnessScore}
    )`

  return {
    tsQuery,
    fullTextMatch,
    fullTextRank,
    trigramMatch,
    trigramSimilarity,
    exact,
    popularityScore,
    freshnessScore,
    relevanceScore,
  }
}
