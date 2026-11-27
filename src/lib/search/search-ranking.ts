import { sql, type SQL } from "drizzle-orm"

import { notes, users } from "@/db"

import { SEARCH_CONFIG, SEARCH_WEIGHTS } from "./search-constants"
import { buildSearchTsQuery, getSearchWords } from "./search-query"
import type { ParsedAcademicQuery } from "./search-types"

/** Simple-config tsquery with prefix support for short words. */
export function buildTsQuery(normalizedQuery: string): SQL {
  return sql`to_tsquery('simple', ${buildSearchTsQuery(normalizedQuery)})`
}

function getMatchPhrase(parsed: ParsedAcademicQuery): string {
  const terms = [...parsed.topicTerms, ...parsed.generalTerms]
  return terms.length > 0 ? terms.join(" ") : parsed.normalized
}

export interface RankingExpressions {
  tsQuery: SQL
  fullTextMatch: SQL<boolean>
  fullTextRank: SQL<number>
  /** Index-driven prefix/typo fallback for metadata fields. */
  fallbackMatch: SQL<boolean> | null
  trigramSimilarity: SQL<number>
  /** Number of query words with a prefix or typo match in searchable metadata. */
  fuzzyWordMatch: SQL<number>
  exact: {
    title: SQL<boolean>
    topic: SQL<boolean>
    subject: SQL<boolean>
    grade: SQL<boolean>
    educationLevel: SQL<boolean>
    tag: SQL<boolean>
    contributor: SQL<boolean> | null
  }
  popularityScore: SQL<number>
  freshnessScore: SQL<number>
  relevanceScore: SQL<number>
}

const FRESHNESS_WINDOW_DAYS = 90
const FRESHNESS_WINDOW_SECONDS = 60 * 60 * 24 * FRESHNESS_WINDOW_DAYS

/**
 * Pure SQL expression builder. The database vector handles complete words;
 * this layer adds short prefixes, per-word typo tolerance, structured boosts,
 * and contributor matching without weakening the published/filter predicates.
 */
export function buildRankingExpressions(
  parsed: ParsedAcademicQuery,
  options: { trigram?: boolean } = {}
): RankingExpressions {
  const trigramEnabled = options.trigram ?? true
  const tsQuery = buildTsQuery(parsed.normalized)
  const phrase = getMatchPhrase(parsed)
  const phraseIsUsable = phrase.length > 0

  const fullTextMatch = sql<boolean>`${notes.searchVector} @@ ${tsQuery}`
  const fullTextRank = sql<number>`ts_rank(${notes.searchVector}, ${tsQuery})`

  const normalizedTitle = sql`notes_normalize_search_text(${notes.title})`
  const normalizedTopic = sql`notes_normalize_search_text(coalesce(${notes.topic}, ''))`
  const normalizedSubject = sql`notes_normalize_search_text(${notes.subject})`
  const normalizedCategory = sql`notes_normalize_search_text(${notes.category})`
  const normalizedCourse = sql`notes_normalize_search_text(${notes.course})`
  const normalizedGrade = sql`notes_normalize_search_text(${notes.grade})`
  const normalizedEducationLevel = sql`notes_normalize_search_text(${notes.educationLevel})`
  const normalizedName = sql`notes_normalize_search_text(${users.name})`
  const normalizedUsername = sql`notes_normalize_search_text(${users.username})`

  const titleSim = sql<number>`similarity(${normalizedTitle}, ${phrase})`
  const topicSim = sql<number>`similarity(${normalizedTopic}, ${phrase})`
  const subjectSim = sql<number>`similarity(${normalizedSubject}, ${phrase})`
  const categorySim = sql<number>`similarity(${normalizedCategory}, ${phrase})`
  const courseSim = sql<number>`similarity(${normalizedCourse}, ${phrase})`
  const gradeSim = sql<number>`similarity(${normalizedGrade}, ${phrase})`
  const educationSim = sql<number>`similarity(${normalizedEducationLevel}, ${phrase})`
  const nameSim = sql<number>`similarity(${normalizedName}, ${phrase})`
  const usernameSim = sql<number>`similarity(${normalizedUsername}, ${phrase})`

  const usePhraseTrigram =
    phrase.length >= SEARCH_CONFIG.minFuzzyLength &&
    phrase.split(" ").length <= 3 &&
    trigramEnabled
  const useWordTrigram = trigramEnabled

  const trigramSimilarity = usePhraseTrigram
    ? sql<number>`GREATEST(${titleSim}, ${topicSim}, ${subjectSim}, ${categorySim}, ${courseSim}, ${gradeSim}, ${educationSim}, ${nameSim}, ${usernameSim})`
    : sql<number>`0`

  // Whole-phrase matching alone misses "newton optics" when a title says
  // "Newton's Laws of Motion and Ray Optics". Match each word independently so
  // one typo does not discard the other useful terms.
  const searchWords = getSearchWords(parsed)
  const searchableText = sql`notes_normalize_search_text(concat_ws(' ',
    ${notes.title}, ${notes.topic}, ${notes.subject}, ${notes.category},
    ${notes.course}, ${notes.grade}, ${notes.educationLevel}, ${users.name},
    ${users.username}, array_to_string(${notes.tags}, ' ')
  ))`

  function buildPrefixMatch(word: string): SQL<boolean> {
    // A boundary before the term makes this a word-prefix match: "art" can
    // match "article", but not "cart".
    const boundaryMatch = sql<boolean>`strpos(' ' || ${searchableText}, ' ' || ${word}) > 0`
    if (!useWordTrigram || word.length < SEARCH_CONFIG.minFuzzyLength) {
      return boundaryMatch
    }

    return sql<boolean>`(
      ${boundaryMatch}
      OR similarity(${searchableText}, ${word}) >= ${SEARCH_CONFIG.trigramThreshold}
    )`
  }

  const wordFallbacks = searchWords.map((word) => {
    const shortPrefix = word.length < SEARCH_CONFIG.minFuzzyLength

    if (useWordTrigram && !shortPrefix) {
      const wordSimilarity = sql<number>`GREATEST(
        similarity(${normalizedTitle}, ${word}),
        similarity(${normalizedTopic}, ${word}),
        similarity(${normalizedSubject}, ${word}),
        similarity(${normalizedCategory}, ${word}),
        similarity(${normalizedCourse}, ${word}),
        similarity(${normalizedGrade}, ${word}),
        similarity(${normalizedEducationLevel}, ${word}),
        similarity(${normalizedName}, ${word}),
        similarity(${normalizedUsername}, ${word})
      )`

      const prefixMatch = buildPrefixMatch(word)

      return sql<boolean>`(
        (${normalizedTitle} % ${word} OR ${normalizedTopic} % ${word}
         OR ${normalizedSubject} % ${word} OR ${normalizedCategory} % ${word}
         OR ${normalizedCourse} % ${word} OR ${normalizedGrade} % ${word}
         OR ${normalizedEducationLevel} % ${word} OR ${normalizedName} % ${word}
         OR ${normalizedUsername} % ${word})
        AND (${wordSimilarity} >= ${SEARCH_CONFIG.trigramThreshold} OR ${prefixMatch})
      )`
    }

    return buildPrefixMatch(word)
  })

  const fuzzyWordMatch = sql<number>`(${
    wordFallbacks.length > 0
      ? sql.join(
          wordFallbacks.map(
            (match) => sql`CASE WHEN ${match} THEN 1 ELSE 0 END`
          ),
          sql` + `
        )
      : sql`0`
  })`

  // Multiword fallback queries should not degenerate into an OR over every
  // word. Require most terms while still allowing one unrecognized/noisy token.
  const requiredFuzzyMatches = Math.max(1, Math.ceil(searchWords.length * 0.75))
  const fallbackMatch =
    wordFallbacks.length > 0
      ? sql<boolean>`(${fuzzyWordMatch}) >= ${requiredFuzzyMatches}`
      : null

  const exact = {
    title: phraseIsUsable
      ? sql<boolean>`${normalizedTitle} = ${phrase}`
      : sql<boolean>`false`,
    topic: phraseIsUsable
      ? sql<boolean>`${normalizedTopic} = ${phrase}`
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
            parsed.tokens.map((token) => sql`${token}`),
            sql`, `
          )}]::text[]`
        : sql<boolean>`false`,
    contributor:
      phraseIsUsable && parsed.generalTerms.length > 0
        ? sql<boolean>`(${normalizedName} = ${phrase} OR ${normalizedUsername} = ${phrase})`
        : null,
  }

  const contributorMatch = exact.contributor ?? sql<boolean>`false`
  const popularityScore = sql<number>`ln(1 + ${notes.downloadCount}) * ${SEARCH_WEIGHTS.popularity}`
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
      + ((${fuzzyWordMatch})::numeric / greatest(1, ${searchWords.length}) * ${SEARCH_WEIGHTS.prefixMatch})
      + ${popularityScore}
      + ${freshnessScore}
    )`

  return {
    tsQuery,
    fullTextMatch,
    fullTextRank,
    fallbackMatch,
    trigramSimilarity,
    fuzzyWordMatch,
    exact,
    popularityScore,
    freshnessScore,
    relevanceScore,
  }
}
