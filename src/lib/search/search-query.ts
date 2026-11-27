import { SEARCH_CONFIG } from "./search-constants"
import { normalizeSearchQuery } from "./search-normalizer"
import type { ParsedAcademicQuery } from "./search-types"

export function damerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array<number>(b.length + 1).fill(0)
  )

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost)
      }
    }
  }

  return matrix[a.length][b.length]
}

/** Short words are prefixes; longer words must be within the edit budget. */
export function isFuzzyWordMatch(query: string, candidate: string): boolean {
  if (query === candidate) return true
  if (query.length < 3 || Math.abs(query.length - candidate.length) > 2) {
    return false
  }
  if (query.length < 4) return candidate.startsWith(query)

  return damerauLevenshtein(query, candidate) <= SEARCH_CONFIG.maxFuzzyDistance
}

/** Builds a valid simple-config tsquery with short-word prefix alternatives. */
export function buildSearchTsQuery(query: string): string {
  const normalized = normalizeSearchQuery(query)
  if (!normalized) return ""

  const words = normalized.split(" ").filter(Boolean).slice(0, 16)
  const clauses = words.map((word) => {
    const alternatives = new Set<string>([word])

    if (word.length <= SEARCH_CONFIG.prefixTokenLength) {
      alternatives.add(`${word}:*`)
    }

    return [...alternatives]
      .map((term) => `'${term.replaceAll("'", "''")}'`)
      .join(" | ")
  })

  return clauses.join(" & ")
}

/** Words used for fuzzy metadata matching, excluding recognized academic fields. */
export function getSearchWords(parsed: ParsedAcademicQuery): string[] {
  const remaining = [...parsed.topicTerms, ...parsed.generalTerms]
  const words = (remaining.length > 0 ? remaining : parsed.tokens)
    .map(normalizeSearchQuery)
    .filter(Boolean)
    .flatMap((term) => term.split(" "))
    .filter((word) => word.length >= 3)

  return [...new Set(words)].slice(0, 12)
}
