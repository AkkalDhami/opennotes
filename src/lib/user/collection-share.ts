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

export function parseCollectionShareSlug(param: string): {
  slug: string
  idPrefix: string | null
} {
  const match = SHARE_ID_PATTERN.exec(param)
  if (!match) return { slug: param, idPrefix: null }
  return { slug: match[1], idPrefix: match[2] }
}
