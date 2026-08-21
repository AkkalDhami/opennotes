import { randomUUID } from "node:crypto"

export const slugify = (input: string): string => {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200) // leave room for a numeric/uuid suffix under the 255 cap

  return base.length > 0 ? base : "note"
}

/**
 * Given a desired base slug, returns a slug that is guaranteed not to
 * collide, using the provided `slugExists` lookup (typically a small
 * `select 1 from notes where slug = $1` query).
 *
 * Tries `base`, then `base-2`, `base-3`, ... up to `maxAttempts`, then
 * falls back to a short UUID suffix so a pathological hot title can never
 * fail the whole submission.
 */
export const generateUniqueSlug = async (
  base: string,
  slugExists: (slug: string) => Promise<boolean>,
  maxAttempts = 25
): Promise<string> => {
  const baseSlug = slugify(base)

  if (!(await slugExists(baseSlug))) {
    return baseSlug
  }

  for (let attempt = 2; attempt <= maxAttempts; attempt++) {
    const candidate = `${baseSlug}-${attempt}`
    if (!(await slugExists(candidate))) {
      return candidate
    }
  }

  // Extremely unlikely fallback: append a short random suffix.
  const shortId = randomUUID().split("-")[0]
  return `${baseSlug}-${shortId}`
}

// convert a slug to a title
export const slugToTitle = (slug: string): string => {
  return slug
    .trim()
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
