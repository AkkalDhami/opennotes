import {
  EDUCATION_LEVEL_ALIASES,
  GRADE_ALIASES,
  SEARCH_STOPWORDS,
  SUBJECT_ALIASES,
} from "./search-constants"
import { normalizeSearchQuery, tokenizeQuery } from "./search-normalizer"
import type { ParsedAcademicQuery } from "./search-types"

const GRADE_PATTERNS: RegExp[] = [
  /\b(?:class|grade)\s+(\d{1,2})\b/,
  /\b(\d{1,2})(?:st|nd|rd|th)\b/,
]

/**
 * Removes a matched phrase from a normalized query string, collapsing any
 * resulting double spaces. Word-boundary safe — won't partially consume a
 * longer word.
 */
function consumePhrase(text: string, phrase: string): string {
  const pattern = new RegExp(
    `\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`
  )
  return text.replace(pattern, " ").replace(/\s+/g, " ").trim()
}

/**
 * Scans `text` for the longest matching alias phrase in `aliases`, longest
 * first so e.g. "database management system" wins over "database
 * management" wins over a hypothetical bare "database". Returns the
 * canonical value and the remaining text with that phrase removed, or
 * `undefined` if nothing matched.
 */
function extractAliasMatch(
  text: string,
  aliases: Record<string, string>
): { value: string; remaining: string } | undefined {
  const phrases = Object.keys(aliases).sort((a, b) => b.length - a.length)

  for (const phrase of phrases) {
    const pattern = new RegExp(
      `\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`
    )
    if (pattern.test(text)) {
      return { value: aliases[phrase], remaining: consumePhrase(text, phrase) }
    }
  }

  return undefined
}

function extractGrade(
  text: string
): { value: string; remaining: string } | undefined {
  for (const pattern of GRADE_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const num = match[1]
      const canonical = GRADE_ALIASES[num]
      if (canonical) {
        return {
          value: canonical,
          remaining: text.replace(match[0], " ").replace(/\s+/g, " ").trim(),
        }
      }
    }
  }
  return undefined
}

export type SubjectResolver = (
  text: string
) => { value: string; remaining: string } | undefined

/**
 * Builds a subject resolver from a static alias dictionary AND an optional
 * list of subjects that actually exist in the database (§7) — e.g. fetched
 * once via `SELECT DISTINCT subject FROM notes` and cached for a few
 * minutes. Database subjects are checked case-insensitively as literal
 * substrings, since contributors may enter subjects that aren't in the
 * static dictionary at all (e.g. "Nepali Literature").
 */
export function createSubjectResolver(
  knownSubjects: string[] = []
): SubjectResolver {
  const dynamicAliases: Record<string, string> = {}
  for (const subject of knownSubjects) {
    dynamicAliases[subject.toLowerCase()] = subject
  }

  // Static aliases take priority (they're curated), then fall back to
  // whatever's actually in the database.
  const combined = { ...dynamicAliases, ...SUBJECT_ALIASES }

  return (text: string) => extractAliasMatch(text, combined)
}

const defaultSubjectResolver = createSubjectResolver()

/**
 * Parses a raw search query into recognized academic metadata plus
 * leftover terms (§5). Never throws, never discards input — if nothing is
 * recognized, the entire query becomes `generalTerms` and search still
 * works via full-text/fuzzy matching alone.
 */
export function parseAcademicQuery(
  rawQuery: string,
  options?: { subjectResolver?: SubjectResolver }
): ParsedAcademicQuery {
  const resolveSubject = options?.subjectResolver ?? defaultSubjectResolver
  const normalized = normalizeSearchQuery(rawQuery)

  if (!normalized) {
    return {
      original: rawQuery,
      normalized: "",
      topicTerms: [],
      generalTerms: [],
      tokens: [],
    }
  }

  let remaining = normalized

  const gradeMatch = extractGrade(remaining)
  if (gradeMatch) remaining = gradeMatch.remaining

  const educationLevelMatch = extractAliasMatch(
    remaining,
    EDUCATION_LEVEL_ALIASES
  )
  if (educationLevelMatch) remaining = educationLevelMatch.remaining

  const subjectMatch = resolveSubject(remaining)
  if (subjectMatch) remaining = subjectMatch.remaining

  const leftoverTokens = tokenizeQuery(remaining).filter(
    (t) => !SEARCH_STOPWORDS.has(t)
  )

  // If we recognized ANY academic metadata, treat what's left as topic
  // terms (the query was clearly structured academically, e.g. "class 12
  // physics ray optics" → topic = ["ray", "optics"]). If we recognized
  // nothing at all, we can't be confident the leftover terms describe a
  // topic rather than, say, a contributor's name or a bare title search —
  // classify them as general terms instead. Either way, nothing is
  // discarded; this only changes which ranking signals get applied.
  const recognizedSomething = Boolean(
    gradeMatch || educationLevelMatch || subjectMatch
  )

  return {
    original: rawQuery,
    normalized,
    grade: gradeMatch?.value,
    educationLevel: educationLevelMatch?.value,
    subject: subjectMatch?.value,
    topicTerms: recognizedSomething ? leftoverTokens : [],
    generalTerms: recognizedSomething ? [] : leftoverTokens,
    tokens: tokenizeQuery(normalized),
  }
}
