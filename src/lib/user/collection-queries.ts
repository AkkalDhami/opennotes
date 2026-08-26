import "server-only"
import { and, desc, eq, inArray, sql } from "drizzle-orm"

import { db, users } from "@/db"
import { collections, collectionNotes, collectionSaves, notes } from "@/db"

import { CollectionsSort } from "@/validations/collection"
import { PublicNote } from "@/types/note"
import { getCurrentUser } from "../auth/get-current-user"
import { parseCollectionShareSlug } from "./collection-share"

export type CollectionRecord = typeof collections.$inferSelect

export type CollectionStats = {
  noteCount: number
  downloadCount: number
  viewCount: number
}

export type CollectionTreeNode = CollectionRecord & {
  stats: CollectionStats
  children: CollectionTreeNode[]
}

export type CollectionLibraryStats = {
  collectionCount: number
  noteCount: number // deduplicated across all of the owner's collections
  downloadCount: number
  viewCount: number
}

/**
 * All of a user's collections, flat (no tree shape yet). Cheap: this is
 * metadata only, no note rows are joined in here.
 */
async function getOwnerCollectionsFlat(ownerId: string) {
  return db.select().from(collections).where(eq(collections.ownerId, ownerId))
}

/**
 * Per-collection aggregated stats (note count + sum of note download/view
 * counts), scoped to a specific set of collection ids. Assumes `notes` has
 * `downloadCount` / `viewCount` columns — rename to match your schema if
 * they're called something else.
 */
async function getStatsForCollections(
  collectionIds: string[]
): Promise<Map<string, CollectionStats>> {
  const map = new Map<string, CollectionStats>()
  if (collectionIds.length === 0) return map

  const rows = await db
    .select({
      collectionId: collectionNotes.collectionId,
      noteCount: sql<number>`count(distinct ${collectionNotes.noteId})`,
      downloadCount: sql<number>`coalesce(sum(${notes.downloadCount}), 0)`,
      viewCount: sql<number>`coalesce(sum(${notes.viewCount}), 0)`,
    })
    .from(collectionNotes)
    .innerJoin(notes, eq(notes.id, collectionNotes.noteId))
    .where(inArray(collectionNotes.collectionId, collectionIds))
    .groupBy(collectionNotes.collectionId)

  for (const row of rows) {
    map.set(row.collectionId, {
      noteCount: Number(row.noteCount),
      downloadCount: Number(row.downloadCount),
      viewCount: Number(row.viewCount),
    })
  }
  return map
}

const EMPTY_STATS: CollectionStats = {
  noteCount: 0,
  downloadCount: 0,
  viewCount: 0,
}

function sortSiblings(
  nodes: CollectionTreeNode[],
  sort: CollectionsSort
): CollectionTreeNode[] {
  const sorted = [...nodes]
  switch (sort) {
    case "name_asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "name_desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name))
      break
    case "created":
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt as unknown as string).getTime() -
          new Date(a.createdAt as unknown as string).getTime()
      )
      break
    case "updated":
      sorted.sort(
        (a, b) =>
          new Date(b.updatedAt as unknown as string).getTime() -
          new Date(a.updatedAt as unknown as string).getTime()
      )
      break
    // "position" is the owner's drag-and-drop order and the default. It also
    // catches `undefined`, which is what an absent `?sort=` param produces.
    case "position":
    default:
      sorted.sort(
        (a, b) =>
          a.position - b.position ||
          new Date(a.createdAt as unknown as string).getTime() -
            new Date(b.createdAt as unknown as string).getTime()
      )
  }
  return sorted
}

/**
 * Builds the nested tree from a flat row list + stats map, filters by a
 * search term (matched against name/description), and sorts each sibling
 * group independently so nesting order stays correct at every level.
 *
 * If a collection matches the search, its ancestor chain is kept too, so the
 * match doesn't disappear inside a collapsed/filtered-out parent.
 */
export function buildCollectionTree(
  flat: CollectionRecord[],
  statsMap: Map<string, CollectionStats>,
  options: { search?: string; sort: CollectionsSort }
): CollectionTreeNode[] {
  const query = options.search?.trim().toLowerCase()

  const byId = new Map<string, CollectionTreeNode>()
  for (const row of flat) {
    byId.set(row.id, {
      ...row,
      stats: statsMap.get(row.id) ?? EMPTY_STATS,
      children: [],
    })
  }

  // Determine which ids match the search directly.
  const matchedIds = new Set<string>()
  if (query) {
    for (const row of flat) {
      const haystack = `${row.name} ${row.description ?? ""}`.toLowerCase()
      if (haystack.includes(query)) matchedIds.add(row.id)
    }
    // Pull in ancestors of every match so results stay reachable in the tree.
    for (const id of [...matchedIds]) {
      let parentId = byId.get(id)?.parentId ?? null
      while (parentId) {
        matchedIds.add(parentId)
        parentId = byId.get(parentId)?.parentId ?? null
      }
    }
  }

  const roots: CollectionTreeNode[] = []
  for (const node of byId.values()) {
    if (query && !matchedIds.has(node.id)) continue
    if (node.parentId && byId.has(node.parentId)) {
      if (query && !matchedIds.has(node.parentId)) {
        roots.push(node) // orphaned by filtering, surface it at top level
      } else {
        byId.get(node.parentId)!.children.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  function sortRecursive(list: CollectionTreeNode[]): CollectionTreeNode[] {
    const sorted = sortSiblings(list, options.sort)
    for (const node of sorted) node.children = sortRecursive(node.children)
    return sorted
  }

  return sortRecursive(roots)
}

export async function getUserCollectionTree(options: {
  ownerId: string
  search?: string
  sort: CollectionsSort
}) {
  const flat = await getOwnerCollectionsFlat(options.ownerId)
  const statsMap = await getStatsForCollections(flat.map((c) => c.id))
  return buildCollectionTree(flat, statsMap, {
    search: options.search,
    sort: options.sort,
  })
}

/**
 * Library-wide stats for the stat cards row. Notes are deduplicated: a note
 * saved in three collections still counts once toward the owner's total.
 */
export async function getLibraryStats(
  ownerId: string
): Promise<CollectionLibraryStats> {
  const [{ collectionCount }] = await db
    .select({ collectionCount: sql<number>`count(*)` })
    .from(collections)
    .where(eq(collections.ownerId, ownerId))

  // Group by note id first so a note in 3 collections is only counted once,
  // then sum in JS — simpler and more portable across drizzle/pg versions
  // than a DISTINCT ON subquery.
  const rows = await db
    .select({
      noteId: collectionNotes.noteId,
      downloadCount: notes.downloadCount,
      viewCount: notes.viewCount,
    })
    .from(collectionNotes)
    .innerJoin(collections, eq(collections.id, collectionNotes.collectionId))
    .innerJoin(notes, eq(notes.id, collectionNotes.noteId))
    .where(eq(collections.ownerId, ownerId))
    .groupBy(collectionNotes.noteId, notes.downloadCount, notes.viewCount)

  let downloadCount = 0
  let viewCount = 0
  for (const row of rows) {
    downloadCount += Number(row.downloadCount ?? 0)
    viewCount += Number(row.viewCount ?? 0)
  }

  return {
    collectionCount: Number(collectionCount ?? 0),
    noteCount: rows.length,
    downloadCount,
    viewCount,
  }
}

export async function getCollectionByOwnerAndSlug(
  ownerId: string,
  slug: string
) {
  const [row] = await db
    .select()
    .from(collections)
    .where(and(eq(collections.ownerId, ownerId), eq(collections.slug, slug)))
    .limit(1)
  return row ?? null
}

export async function getCollectionById(id: string) {
  const [row] = await db
    .select()
    .from(collections)
    .where(eq(collections.id, id))
    .limit(1)
  return row ?? null
}

/** Direct children of a collection, metadata + stats only (no notes). */
export async function getChildCollections(parentId: string) {
  const flat = await db
    .select()
    .from(collections)
    .where(eq(collections.parentId, parentId))
    .orderBy(collections.position)
  const statsMap = await getStatsForCollections(flat.map((c) => c.id))
  return flat.map((c) => ({ ...c, stats: statsMap.get(c.id) ?? EMPTY_STATS }))
}

export async function getCollectionNotes(
  collectionId: string,
  options: { publishedOnly?: boolean } = {}
): Promise<PublicNote[]> {
  const user = await getCurrentUser()

  return db
    .select({
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

      sourceType: notes.sourceType,
      sourceUrl: notes.sourceUrl,
      originalAuthor: notes.originalAuthor,

      downloadCount: notes.downloadCount,
      viewCount: notes.viewCount,
      publishedAt: notes.publishedAt,
      contributorId: users.id,
      contributorName: users.name,
      contributorUsername: users.username,
      contributorAvatarUrl: users.avatarUrl,
      lastModifiedAt: notes.updatedAt,

      contributorPublishedCount: sql<number>`(
        SELECT count(*)::int FROM notes n2
        WHERE n2.contributor_id = ${users.id} AND n2.status = 'PUBLISHED'
      )`,

      isBookmarked: user
        ? sql<boolean>`EXISTS (
          SELECT 1
          FROM bookmarks b
          WHERE b.note_id = ${notes.id}
            AND b.user_id = ${user.id}
        )`
        : sql<boolean>`false`,
    })
    .from(collectionNotes)
    .innerJoin(notes, eq(notes.id, collectionNotes.noteId))
    .innerJoin(users, eq(users.id, notes.contributorId))
    .where(
      and(
        eq(collectionNotes.collectionId, collectionId),
        // Public collection pages must never leak a note that is pending
        // review, rejected, or taken down — even if it's still in the
        // collection.
        options.publishedOnly ? eq(notes.status, "PUBLISHED") : undefined
      )
    )
    .then((rows) =>
      rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        subject: row.subject,
        grade: row.grade,
        educationLevel: row.educationLevel as PublicNote["educationLevel"],
        course: row.course,
        topic: row.topic,
        academicYear: row.academicYear,
        tags: row.tags || [],
        pageCount: row.pageCount,
        fileSizeBytes: row.fileSizeBytes,
        filePath: row.filePath,

        sourceType: row.sourceType,
        sourceUrl: row.sourceUrl,
        originalAuthor: row.originalAuthor,

        isBookmarked: row.isBookmarked,

        downloadCount: row.downloadCount,
        viewCount: row.viewCount,
        publishedAt: row.publishedAt ? new Date(row.publishedAt) : new Date(),
        lastModifiedAt: row.lastModifiedAt
          ? new Date(row.lastModifiedAt)
          : null,
        contributor: {
          id: row.contributorId,
          name: row.contributorName,
          username: row.contributorUsername,
          avatarUrl: row.contributorAvatarUrl,
          publishedNoteCount: row.contributorPublishedCount,
        },
      }))
    )
}

export async function isCollectionSavedByUser(
  userId: string,
  collectionId: string
) {
  const [row] = await db
    .select({ userId: collectionSaves.userId })
    .from(collectionSaves)
    .where(
      and(
        eq(collectionSaves.userId, userId),
        eq(collectionSaves.collectionId, collectionId)
      )
    )
    .limit(1)
  return Boolean(row)
}

/** Lightweight {id, name, parentId} list for the "Parent" selector in dialogs. */
export async function getOwnerCollectionOptions(ownerId: string) {
  return db
    .select({
      id: collections.id,
      name: collections.name,
      parentId: collections.parentId,
      visibility: collections.visibility,
    })
    .from(collections)
    .where(eq(collections.ownerId, ownerId))
    .orderBy(collections.name)
}

/** Walks up parentId pointers — used to guard against circular nesting. */
export async function collectDescendantIds(
  rootId: string,
  ownerId?: string
): Promise<Set<string>> {
  const all = await db
    .select({ id: collections.id, parentId: collections.parentId })
    .from(collections)
    .where(ownerId ? eq(collections.ownerId, ownerId) : undefined)
  const childrenOf = new Map<string, string[]>()
  for (const row of all) {
    if (!row.parentId) continue
    const list = childrenOf.get(row.parentId) ?? []
    list.push(row.id)
    childrenOf.set(row.parentId, list)
  }
  const result = new Set<string>()
  const stack = [...(childrenOf.get(rootId) ?? [])]
  while (stack.length) {
    const id = stack.pop()!
    if (result.has(id)) continue
    result.add(id)
    stack.push(...(childrenOf.get(id) ?? []))
  }
  return result
}

export async function getOwnerCollectionTreeWithNoteMembership(options: {
  ownerId: string
  noteId: string
}): Promise<{ tree: CollectionTreeNode[]; noteCollectionIds: string[] }> {
  const flat = await getOwnerCollectionsFlat(options.ownerId)

  if (flat.length === 0) {
    return { tree: [], noteCollectionIds: [] }
  }

  const statsMap = await getStatsForCollections(flat.map((c) => c.id))
  const tree = buildCollectionTree(flat, statsMap, { sort: "name_asc" })

  const existing = await db
    .select({ collectionId: collectionNotes.collectionId })
    .from(collectionNotes)
    .where(
      and(
        eq(collectionNotes.noteId, options.noteId),
        inArray(
          collectionNotes.collectionId,
          flat.map((c) => c.id)
        )
      )
    )

  return {
    tree,
    noteCollectionIds: existing.map((row) => row.collectionId),
  }
}

/**
 * The owner's whole tree plus the ids that are invalid drop targets for a
 * given collection: itself and everything below it. Backs the "Move to…"
 * picker, where nesting a collection inside its own descendant would orphan
 * the subtree from the root.
 */
export async function getMoveTargetTree(options: {
  ownerId: string
  collectionId: string
}): Promise<{
  tree: CollectionTreeNode[]
  blockedIds: string[]
  currentParentId: string | null
}> {
  const flat = await getOwnerCollectionsFlat(options.ownerId)
  const self = flat.find((row) => row.id === options.collectionId)

  if (!self) {
    return { tree: [], blockedIds: [], currentParentId: null }
  }

  const statsMap = await getStatsForCollections(flat.map((c) => c.id))
  const tree = buildCollectionTree(flat, statsMap, { sort: "position" })

  const descendantIds = await collectDescendantIds(
    options.collectionId,
    options.ownerId
  )

  return {
    tree,
    blockedIds: [options.collectionId, ...descendantIds],
    currentParentId: self.parentId,
  }
}

export type PublicCollectionOwner = {
  id: string
  name: string | null
  username: string | null
  avatarUrl: string | null
}

/**
 * Resolves a `/collections/[slug]` route param to a PUBLIC collection.
 *
 * Prefers the id suffix that {@link buildCollectionShareSlug} appends, so
 * shared links survive a rename. Falls back to matching the whole param as a
 * slug: that's ambiguous in principle (slugs are unique per owner, not
 * globally), so the oldest match wins — deterministic, and only reachable via
 * hand-typed URLs since every generated link carries the suffix.
 *
 * Returns null for private collections, which the page turns into a 404 rather
 * than a 403 — we don't want to confirm that a private collection exists.
 */
export async function getPublicCollectionByShareSlug(
  param: string
): Promise<CollectionRecord | null> {
  const { slug, idPrefix } = parseCollectionShareSlug(param)

  if (idPrefix) {
    const rows = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.visibility, "PUBLIC"),
          sql`${collections.id}::text like ${`${idPrefix}%`}`
        )
      )
      .limit(2)

    const match =
      rows.find((row) => row.slug === slug) ??
      (rows.length === 1 ? rows[0] : null)

    if (match) return match
  }

  const [bare] = await db
    .select()
    .from(collections)
    .where(
      and(eq(collections.visibility, "PUBLIC"), eq(collections.slug, param))
    )
    .orderBy(collections.createdAt)
    .limit(1)

  return bare ?? null
}

export async function getPublicCollectionOwner(
  ownerId: string
): Promise<PublicCollectionOwner | null> {
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, ownerId))
    .limit(1)

  return row ?? null
}

/** Public subcollections only — a private child stays hidden on a public page. */
export async function getPublicChildCollections(parentId: string) {
  const flat = await db
    .select()
    .from(collections)
    .where(
      and(
        eq(collections.parentId, parentId),
        eq(collections.visibility, "PUBLIC")
      )
    )
    .orderBy(collections.position)

  const statsMap = await getStatsForCollections(flat.map((c) => c.id))
  return flat.map((c) => ({ ...c, stats: statsMap.get(c.id) ?? EMPTY_STATS }))
}

/**
 * Ancestor chain for public breadcrumbs, root-first. Stops at the first
 * private ancestor: a public collection nested under a private one is still
 * publicly reachable, but we don't reveal the private parent's name.
 */
export async function getPublicCollectionAncestors(
  collection: CollectionRecord
): Promise<CollectionRecord[]> {
  const chain: CollectionRecord[] = []
  let parentId = collection.parentId
  // Depth guard: parent_id has no FK, so a corrupt row can't be allowed to
  // spin this loop forever.
  let hops = 0

  while (parentId && hops < 20) {
    const [parent] = await db
      .select()
      .from(collections)
      .where(eq(collections.id, parentId))
      .limit(1)

    if (!parent || parent.visibility !== "PUBLIC") break

    chain.unshift(parent)
    parentId = parent.parentId
    hops++
  }

  return chain
}

/* -------------------------------------------------------------------------- */
/*  Owner-facing collection overview                                          */
/* -------------------------------------------------------------------------- */

/** A subcollection as shown in a parent's detail view or details dialog. */
export type CollectionChildSummary = CollectionRecord & {
  stats: CollectionStats
  /** Direct children only — enough to render "3 subcollections". */
  childCount: number
}

/**
 * Trimmed note row for previews. Deliberately not {@link PublicNote}: the
 * details dialog only needs a title, a couple of numbers, and the status badge,
 * and hydrating contributors for every note in every card would be wasteful.
 */
export type CollectionNotePreview = {
  id: string
  slug: string
  title: string
  subject: string | null
  status: CollectionRecordNoteStatus
  pageCount: number | null
  downloadCount: number
  viewCount: number
  updatedAt: Date | null
}

type CollectionRecordNoteStatus = (typeof notes.$inferSelect)["status"]

export type CollectionOverview = {
  collection: CollectionRecord
  /** Root-first, excluding the collection itself. */
  ancestors: CollectionRecord[]
  children: CollectionChildSummary[]
  /** Truncated: compare `notes.length` against `stats.noteCount`. */
  notes: CollectionNotePreview[]
  /** Notes directly in this collection, and their download/view totals. */
  stats: CollectionStats
  /** The same three numbers rolled up over this collection and every descendant. */
  rollup: CollectionStats
  descendantCount: number
}

/**
 * Ancestor chain for the owner's own breadcrumbs, root-first.
 *
 * Unlike {@link getPublicCollectionAncestors} this doesn't stop at private
 * parents — the owner is allowed to see their whole path — but it does stay
 * inside one owner, and it tracks visited ids because `parent_id` has no
 * foreign key and therefore no protection against a cycle.
 */
export async function getOwnerCollectionAncestors(
  collection: CollectionRecord
): Promise<CollectionRecord[]> {
  const chain: CollectionRecord[] = []
  const seen = new Set<string>([collection.id])
  let parentId = collection.parentId

  while (parentId && !seen.has(parentId) && chain.length < 20) {
    const [parent] = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.id, parentId),
          eq(collections.ownerId, collection.ownerId)
        )
      )
      .limit(1)

    if (!parent) break

    seen.add(parent.id)
    chain.unshift(parent)
    parentId = parent.parentId
  }

  return chain
}

/**
 * Stats across several collections at once, with notes deduplicated: a note
 * filed in both a parent and its child counts once in the rollup.
 */
async function getRollupStats(
  collectionIds: string[]
): Promise<CollectionStats> {
  if (collectionIds.length === 0) return EMPTY_STATS

  const rows = await db
    .select({
      noteId: collectionNotes.noteId,
      downloadCount: notes.downloadCount,
      viewCount: notes.viewCount,
    })
    .from(collectionNotes)
    .innerJoin(notes, eq(notes.id, collectionNotes.noteId))
    .where(inArray(collectionNotes.collectionId, collectionIds))
    .groupBy(collectionNotes.noteId, notes.downloadCount, notes.viewCount)

  let downloadCount = 0
  let viewCount = 0
  for (const row of rows) {
    downloadCount += Number(row.downloadCount ?? 0)
    viewCount += Number(row.viewCount ?? 0)
  }

  return { noteCount: rows.length, downloadCount, viewCount }
}

/** How many direct children each of the given collections has. */
async function getChildCountMap(
  parentIds: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (parentIds.length === 0) return map

  const rows = await db
    .select({
      parentId: collections.parentId,
      childCount: sql<number>`count(*)`,
    })
    .from(collections)
    .where(inArray(collections.parentId, parentIds))
    .groupBy(collections.parentId)

  for (const row of rows) {
    if (row.parentId) map.set(row.parentId, Number(row.childCount))
  }
  return map
}

/** Notes in a collection, trimmed to what a preview list renders. */
export async function getCollectionNotePreviews(
  collectionId: string,
  options: { limit?: number; publishedOnly?: boolean } = {}
): Promise<CollectionNotePreview[]> {
  const rows = await db
    .select({
      id: notes.id,
      slug: notes.slug,
      title: notes.title,
      subject: notes.subject,
      status: notes.status,
      pageCount: notes.pageCount,
      downloadCount: notes.downloadCount,
      viewCount: notes.viewCount,
      updatedAt: notes.updatedAt,
    })
    .from(collectionNotes)
    .innerJoin(notes, eq(notes.id, collectionNotes.noteId))
    .where(
      and(
        eq(collectionNotes.collectionId, collectionId),
        options.publishedOnly ? eq(notes.status, "PUBLISHED") : undefined
      )
    )
    // `collection_notes` stores no "added at", so recency of the note itself is
    // the closest thing to a meaningful default order.
    .orderBy(desc(notes.updatedAt))
    .limit(options.limit ?? 6)

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    subject: row.subject,
    status: row.status,
    pageCount: row.pageCount,
    downloadCount: Number(row.downloadCount ?? 0),
    viewCount: Number(row.viewCount ?? 0),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : null,
  }))
}

/**
 * Everything one collection's own detail view needs, in a single call:
 * breadcrumbs, subcollections with their own counts, a preview of the notes,
 * and both direct and rolled-up stats.
 *
 * Resolve by `collectionId` (the details dialog, which drills down by id) or by
 * `slug` (the `/profile/collections/[slug]` page). Returns null when the
 * collection doesn't exist or belongs to someone else, so callers can 404
 * without distinguishing the two cases.
 */
export async function getOwnerCollectionOverview(options: {
  ownerId: string
  collectionId?: string
  slug?: string
  noteLimit?: number
}): Promise<CollectionOverview | null> {
  const { ownerId, collectionId, slug } = options

  if (!collectionId && !slug) return null

  const [collection] = await db
    .select()
    .from(collections)
    .where(
      and(
        eq(collections.ownerId, ownerId),
        collectionId
          ? eq(collections.id, collectionId)
          : eq(collections.slug, slug!)
      )
    )
    .limit(1)

  if (!collection) return null

  const [ancestors, childRows, notePreviews, descendantIds] = await Promise.all(
    [
      getOwnerCollectionAncestors(collection),
      db
        .select()
        .from(collections)
        .where(
          and(
            eq(collections.parentId, collection.id),
            eq(collections.ownerId, ownerId)
          )
        )
        .orderBy(collections.position, collections.createdAt),
      getCollectionNotePreviews(collection.id, {
        limit: options.noteLimit ?? 6,
      }),
      collectDescendantIds(collection.id, ownerId),
    ]
  )

  const childIds = childRows.map((row) => row.id)

  const [statsMap, childCounts, rollup] = await Promise.all([
    getStatsForCollections([collection.id, ...childIds]),
    getChildCountMap(childIds),
    getRollupStats([collection.id, ...descendantIds]),
  ])

  return {
    collection,
    ancestors,
    children: childRows.map((row) => ({
      ...row,
      stats: statsMap.get(row.id) ?? EMPTY_STATS,
      childCount: childCounts.get(row.id) ?? 0,
    })),
    notes: notePreviews,
    stats: statsMap.get(collection.id) ?? EMPTY_STATS,
    rollup,
    descendantCount: descendantIds.size,
  }
}
