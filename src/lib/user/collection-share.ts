/**
 * Public share links for collections.
 *
 * Collection slugs are only unique per owner (`collections_owner_slug_idx` is
 * on `(owner_id, slug)`), so a bare slug is ambiguous on a global public route:
 * two people can both have a "bca-1st-semester". Share links therefore carry a
 * short id suffix — the first 8 characters of the collection uuid, which is the
 * first hyphen-delimited group of its text form:
 *
 *   /collections/bca-1st-semester-46f44ccc
 *
 * Resolution prefers the id suffix, so a link keeps working after the owner
 * renames the collection (and its slug changes). A bare slug still resolves
 * when it happens to be unambiguous, which keeps hand-typed URLs usable.
 *
 * This module is deliberately free of server-only imports so both the share
 * dialog (client) and the public page (server) can build the same URL.
 */

/** Characters of the uuid used as the disambiguating suffix. */
export const COLLECTION_SHARE_ID_LENGTH = 8

const SHARE_ID_PATTERN = new RegExp(
  `^(.*)-([0-9a-f]{${COLLECTION_SHARE_ID_LENGTH}})$`
)

export type ShareableCollection = {
  id: string
  slug: string
}

/** `bca-1st-semester` + `46f44ccc-…` -> `bca-1st-semester-46f44ccc` */
export function buildCollectionShareSlug(collection: ShareableCollection) {
  const idPrefix = collection.id.slice(0, COLLECTION_SHARE_ID_LENGTH)
  return `${collection.slug}-${idPrefix}`
}

/** Root-relative path — prepend an origin to get an absolute share URL. */
export function buildCollectionSharePath(collection: ShareableCollection) {
  return `/collections/${buildCollectionShareSlug(collection)}`
}

export function buildCollectionShareUrl(
  origin: string,
  collection: ShareableCollection
) {
  return `${origin}${buildCollectionSharePath(collection)}`
}

/**
 * Splits a route param back into its parts. `idPrefix` is null when the param
 * carries no recognizable suffix, in which case the caller should fall back to
 * a bare-slug lookup.
 *
 * A slug that genuinely ends in something like `-a1b2c3d4` parses as a suffix;
 * that's fine, since the id lookup simply finds nothing and the caller falls
 * back to matching the whole param as a slug.
 */
export function parseCollectionShareSlug(param: string): {
  slug: string
  idPrefix: string | null
} {
  const match = SHARE_ID_PATTERN.exec(param)
  if (!match) return { slug: param, idPrefix: null }
  return { slug: match[1], idPrefix: match[2] }
}
