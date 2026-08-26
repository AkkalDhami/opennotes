"use server"

import { and, eq, inArray, isNull, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getCurrentUser } from "@/lib/auth/get-current-user"
import { db } from "@/db"
import { collections, collectionNotes, collectionSaves, notes } from "@/db"
import { ilike, notInArray } from "drizzle-orm"

import {
  AddNotesToCollectionSchema,
  CollectionMoveTargetsSchema,
  CollectionOverviewSchema,
  DeleteCollectionSchema,
  DuplicateCollectionInput,
  DuplicateCollectionSchema,
  MoveCollectionSchema,
  MoveCollectionToParentInput,
  MoveCollectionToParentSchema,
  RemoveNoteFromCollectionSchema,
  ReorderCollectionsSchema,
  SaveCollectionSchema,
  UpdateCollectionSchema,
  CreateCollectionInput,
  CreateCollectionSchema,
  CreateSubcollectionInput,
  UpdateCollectionInput,
} from "@/validations/collection"
import {
  collectDescendantIds,
  getCollectionById,
  getMoveTargetTree,
  getOwnerCollectionOverview,
  type CollectionOverview,
  type CollectionRecord,
  type CollectionTreeNode,
} from "./collection-queries"

export type ActionResult<T = undefined> =
  { ok: true; data: T } | { ok: false; error: string }

/** Hard ceiling on a single duplicate, so one click can't fan out unbounded work. */
const MAX_DUPLICATE_NODES = 500

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

async function ensureUniqueSlug(
  ownerId: string,
  parentId: string | null,
  name: string
) {
  const ownSlug = slugify(name) || "collection"

  let baseSlug = ownSlug

  if (parentId) {
    const [parent] = await db
      .select({
        slug: collections.slug,
      })
      .from(collections)
      .where(
        and(eq(collections.id, parentId), eq(collections.ownerId, ownerId))
      )
      .limit(1)

    if (parent) {
      baseSlug = `${parent.slug}-${ownSlug}`
    }
  }

  let candidate = baseSlug
  let suffix = 2

  while (true) {
    const [existing] = await db
      .select({
        id: collections.id,
      })
      .from(collections)
      .where(
        and(eq(collections.ownerId, ownerId), eq(collections.slug, candidate))
      )
      .limit(1)

    if (!existing) {
      return candidate
    }

    candidate = `${baseSlug}-${suffix}`
    suffix++
  }
}

/**
 * In-memory slug allocator for bulk inserts.
 *
 * `ensureUniqueSlug` queries per candidate, which can't see rows inserted
 * earlier in the *same* transaction — so duplicating a tree with it would
 * collide on `collections_owner_slug_idx`. This preloads the owner's slugs
 * once and reserves each new one as it's handed out.
 */
function createSlugAllocator(taken: Set<string>) {
  return function allocate(name: string, parentSlug?: string | null) {
    const ownSlug = slugify(name) || "collection"
    // Parent-prefixed slugs compound with depth (a child's slug already
    // contains its parent's), so cap the base before adding a numeric suffix.
    const baseSlug = (parentSlug ? `${parentSlug}-${ownSlug}` : ownSlug).slice(
      0,
      120
    )

    let candidate = baseSlug
    let suffix = 2
    while (taken.has(candidate)) {
      candidate = `${baseSlug}-${suffix}`
      suffix++
    }

    taken.add(candidate)
    return candidate
  }
}

/** Appends to the end of a sibling group: max(position) + 1, or 0 if empty. */
async function nextSiblingPosition(ownerId: string, parentId: string | null) {
  const [row] = await db
    .select({
      next: sql<number>`coalesce(max(${collections.position}), -1) + 1`,
    })
    .from(collections)
    .where(
      and(
        eq(collections.ownerId, ownerId),
        parentId
          ? eq(collections.parentId, parentId)
          : isNull(collections.parentId)
      )
    )

  return Number(row?.next ?? 0)
}

export async function revalidateCollectionPaths(slug?: string) {
  revalidatePath("/profile/collections")
  revalidatePath("/profile/saved-collections")
  if (slug) revalidatePath(`/profile/collections/${slug}`)
  // Public share pages are a separate route tree; revalidate the whole dynamic
  // segment since one collection can be reachable under several params.
  revalidatePath("/collections/[slug]", "page")
}

async function requireOwnedCollection(id: string, ownerId: string) {
  const collection = await getCollectionById(id)
  if (!collection) return { collection: null, error: "Collection not found" }
  if (collection.ownerId !== ownerId) {
    return { collection: null, error: "You don't own this collection" }
  }
  return { collection, error: null }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  )
}

export async function createCollection(
  input: CreateCollectionInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      ok: false,
      error: "You must be signed in",
    }
  }

  const parsed = CreateCollectionSchema.safeParse(input)

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  const { name, description, parentId, visibility } = parsed.data

  // If nested, verify that the parent belongs to the current user.
  if (parentId) {
    const { error } = await requireOwnedCollection(parentId, user.id)

    if (error) {
      return {
        ok: false,
        error: "Invalid parent collection",
      }
    }
  }

  const slug = await ensureUniqueSlug(user.id, parentId ?? null, slugify(name))

  // New collections land at the end of their sibling group. Inserting at 0
  // (the old behaviour) gave every collection the same position, which left
  // the custom drag-and-drop order undefined.
  const position = await nextSiblingPosition(user.id, parentId ?? null)

  try {
    const [created] = await db
      .insert(collections)
      .values({
        ownerId: user.id,
        parentId: parentId ?? null,
        name,
        slug,
        description: description || null,
        position,
        visibility: visibility,
      })
      .returning({
        id: collections.id,
        slug: collections.slug,
      })

    revalidateCollectionPaths()

    return {
      ok: true,
      data: created,
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        error: "A collection with this name already exists.",
      }
    }

    console.error("Failed to create collection:", error)

    return {
      ok: false,
      error: "Failed to create collection",
    }
  }
}

export async function createSubcollection(
  input: CreateSubcollectionInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  return createCollection({
    name: input.name,
    description: input.description,
    parentId: input.parentId,
  })
}

export async function updateCollection(
  input: UpdateCollectionInput
): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = UpdateCollectionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  const { collection, error } = await requireOwnedCollection(
    parsed.data.id,
    user.id
  )
  if (error || !collection) return { ok: false, error: error ?? "Not found" }

  await db
    .update(collections)
    .set({
      name: parsed.data.name,
      description: parsed.data.description || null,
      // `visibility` was parsed and then dropped, so the edit dialog's Public /
      // Private radio never persisted: a collection could not be made public,
      // which in turn meant Share never appeared for it. Left off entirely when
      // absent, so a caller that omits it doesn't reset the collection to
      // private by accident.
      ...(parsed.data.visibility
        ? { visibility: parsed.data.visibility }
        : null),
      updatedAt: new Date(),
    })
    .where(eq(collections.id, collection.id))

  revalidateCollectionPaths(collection.slug)
  return { ok: true, data: undefined }
}

export async function deleteCollection(input: {
  id: string
}): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = DeleteCollectionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid input" }

  const { collection, error } = await requireOwnedCollection(
    parsed.data.id,
    user.id
  )
  if (error || !collection) return { ok: false, error: error ?? "Not found" }

  const descendantIds = await collectDescendantIds(collection.id, user.id)
  await db.transaction(async (tx) => {
    if (descendantIds.size > 0) {
      await tx
        .delete(collections)
        .where(inArray(collections.id, [...descendantIds]))
    }
    await tx.delete(collections).where(eq(collections.id, collection.id))
  })

  revalidateCollectionPaths(collection.slug)
  return { ok: true, data: undefined }
}

export async function addNotesToCollection(input: {
  collectionId: string
  noteIds: string[]
}): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = AddNotesToCollectionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  const { collection, error } = await requireOwnedCollection(
    parsed.data.collectionId,
    user.id
  )
  if (error || !collection) return { ok: false, error: error ?? "Not found" }

  await db
    .insert(collectionNotes)
    .values(
      parsed.data.noteIds.map((noteId) => ({
        collectionId: collection.id,
        noteId,
      }))
    )
    .onConflictDoNothing() // a note can't be added twice to the same collection

  revalidateCollectionPaths(collection.slug)
  return { ok: true, data: undefined }
}

export async function removeNoteFromCollection(input: {
  collectionId: string
  noteId: string
}): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = RemoveNoteFromCollectionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid input" }

  const { collection, error } = await requireOwnedCollection(
    parsed.data.collectionId,
    user.id
  )
  if (error || !collection) return { ok: false, error: error ?? "Not found" }

  await db
    .delete(collectionNotes)
    .where(
      and(
        eq(collectionNotes.collectionId, collection.id),
        eq(collectionNotes.noteId, parsed.data.noteId)
      )
    )

  revalidateCollectionPaths(collection.slug)
  return { ok: true, data: undefined }
}

/** Full sibling-group reorder, used by drag-and-drop once it's wired up. */
export async function reorderCollections(input: {
  parentId: string | null
  orderedIds: string[]
}): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = ReorderCollectionsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid input" }

  const rows = await db
    .select({
      id: collections.id,
      ownerId: collections.ownerId,
      parentId: collections.parentId,
    })
    .from(collections)
    .where(inArray(collections.id, parsed.data.orderedIds))

  if (rows.length !== parsed.data.orderedIds.length) {
    return { ok: false, error: "One or more collections were not found" }
  }
  const allOwnedAndSameParent = rows.every(
    (r) => r.ownerId === user.id && r.parentId === parsed.data.parentId
  )
  if (!allOwnedAndSameParent) {
    return {
      ok: false,
      error: "Collections must share a parent and be owned by you",
    }
  }

  await db.transaction(async (tx) => {
    await Promise.all(
      parsed.data.orderedIds.map((id, index) =>
        tx
          .update(collections)
          .set({ position: index })
          .where(eq(collections.id, id))
      )
    )
  })

  revalidateCollectionPaths()
  return { ok: true, data: undefined }
}

/**
 * Keyboard-accessible single-step reorder, kept alongside drag-and-drop for
 * screen-reader and keyboard-only users (and as a fallback when a drag can't
 * be completed).
 *
 * Rather than swapping two `position` values, this rewrites the whole sibling
 * group to 0..n-1. Legacy rows all share `position: 0` — a swap between two
 * equal positions is a silent no-op, so normalizing is what makes the first
 * move on old data actually stick.
 */
export async function moveCollection(input: {
  id: string
  direction: "up" | "down"
}): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = MoveCollectionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid input" }

  const { collection, error } = await requireOwnedCollection(
    parsed.data.id,
    user.id
  )
  if (error || !collection) return { ok: false, error: error ?? "Not found" }

  const siblings = await db
    .select()
    .from(collections)
    .where(
      and(
        eq(collections.ownerId, user.id),
        collection.parentId
          ? eq(collections.parentId, collection.parentId)
          : isNull(collections.parentId)
      )
    )

  siblings.sort(
    (a, b) =>
      a.position - b.position ||
      new Date(a.createdAt as unknown as string).getTime() -
        new Date(b.createdAt as unknown as string).getTime()
  )

  const index = siblings.findIndex((s) => s.id === collection.id)
  const swapIndex = parsed.data.direction === "up" ? index - 1 : index + 1
  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) {
    return { ok: true, data: undefined } // already at the edge, no-op
  }

  const orderedIds = siblings.map((s) => s.id)
  ;[orderedIds[index], orderedIds[swapIndex]] = [
    orderedIds[swapIndex],
    orderedIds[index],
  ]

  await db.transaction(async (tx) => {
    await Promise.all(
      orderedIds.map((id, position) =>
        tx.update(collections).set({ position }).where(eq(collections.id, id))
      )
    )
  })

  revalidateCollectionPaths()
  return { ok: true, data: undefined }
}

/**
 * Deep-copies a collection and everything under it:
 *
 *   authenticate -> verify ownership -> load descendant tree -> create root
 *   duplicate -> create child duplicates -> build oldId -> newId map -> copy
 *   collection_notes -> commit -> revalidate
 *
 * Structure and note memberships are copied; the notes themselves are not
 * touched (`collection_notes` is a join table, so a note can sit in both the
 * original and the copy). Everything after the ownership check runs in one
 * transaction, so a failure half-way can't leave a partial subtree behind.
 */
export async function duplicateCollection(
  input: DuplicateCollectionInput
): Promise<ActionResult<{ id: string; slug: string; name: string }>> {
  // 1. Authenticate.
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = DuplicateCollectionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  // 2. Verify the source collection belongs to this user.
  const { collection: source, error } = await requireOwnedCollection(
    parsed.data.id,
    user.id
  )
  if (error || !source) return { ok: false, error: error ?? "Not found" }

  // 3. Load the entire descendant tree, owner-scoped.
  const descendantIds = await collectDescendantIds(source.id, user.id)
  const sourceIds = [source.id, ...descendantIds]

  if (sourceIds.length > MAX_DUPLICATE_NODES) {
    return {
      ok: false,
      error: `This collection has too many subcollections to duplicate at once (limit ${MAX_DUPLICATE_NODES}).`,
    }
  }

  const sourceRows = await db
    .select()
    .from(collections)
    .where(
      and(eq(collections.ownerId, user.id), inArray(collections.id, sourceIds))
    )

  const rowById = new Map(sourceRows.map((row) => [row.id, row]))
  if (!rowById.has(source.id))
    return { ok: false, error: "Collection not found" }

  // Children grouped by parent, in a stable order so the copy's positions
  // match what the owner sees.
  const childrenOf = new Map<string, CollectionRecord[]>()
  for (const row of sourceRows) {
    if (row.id === source.id || !row.parentId) continue
    const siblings = childrenOf.get(row.parentId) ?? []
    siblings.push(row)
    childrenOf.set(row.parentId, siblings)
  }
  for (const siblings of childrenOf.values()) {
    siblings.sort(
      (a, b) =>
        a.position - b.position ||
        new Date(a.createdAt as unknown as string).getTime() -
          new Date(b.createdAt as unknown as string).getTime()
    )
  }

  const ownerSlugs = await db
    .select({ slug: collections.slug })
    .from(collections)
    .where(eq(collections.ownerId, user.id))

  const allocateSlug = createSlugAllocator(
    new Set(ownerSlugs.map((row) => row.slug))
  )

  const rootName = `${source.name} (copy)`
  const rootSlug = allocateSlug(rootName)
  const rootPosition = await nextSiblingPosition(user.id, source.parentId)

  try {
    const duplicate = await db.transaction(async (tx) => {
      // 4. Create the root duplicate, as a sibling of the original.
      const [root] = await tx
        .insert(collections)
        .values({
          ownerId: user.id,
          parentId: source.parentId,
          name: rootName,
          slug: rootSlug,
          description: source.description,
          visibility: source.visibility,
          position: rootPosition,
        })
        .returning({
          id: collections.id,
          slug: collections.slug,
          name: collections.name,
        })

      // 5 + 6. Breadth-first so a parent duplicate always exists before its
      // children, building the oldId -> newId map as we go.
      const idMap = new Map<string, string>([[source.id, root.id]])
      const slugMap = new Map<string, string>([[source.id, root.slug]])
      const queue: string[] = [source.id]

      while (queue.length > 0) {
        const oldParentId = queue.shift()!
        const newParentId = idMap.get(oldParentId)!
        const newParentSlug = slugMap.get(oldParentId)!
        const children = childrenOf.get(oldParentId) ?? []

        for (const [index, child] of children.entries()) {
          const childSlug = allocateSlug(child.name, newParentSlug)

          const [inserted] = await tx
            .insert(collections)
            .values({
              ownerId: user.id,
              parentId: newParentId,
              name: child.name,
              slug: childSlug,
              description: child.description,
              visibility: child.visibility,
              position: index,
            })
            .returning({ id: collections.id, slug: collections.slug })

          idMap.set(child.id, inserted.id)
          slugMap.set(child.id, inserted.slug)
          queue.push(child.id)
        }
      }

      // 7. Copy note memberships through the id map.
      let copiedNoteCount = 0
      if (parsed.data.includeNotes) {
        const memberships = await tx
          .select({
            collectionId: collectionNotes.collectionId,
            noteId: collectionNotes.noteId,
          })
          .from(collectionNotes)
          .where(inArray(collectionNotes.collectionId, [...idMap.keys()]))

        const values = memberships.flatMap((row) => {
          const newCollectionId = idMap.get(row.collectionId)
          return newCollectionId
            ? [{ collectionId: newCollectionId, noteId: row.noteId }]
            : []
        })

        if (values.length > 0) {
          await tx.insert(collectionNotes).values(values).onConflictDoNothing()
          copiedNoteCount = values.length
        }
      }

      return { ...root, copiedNoteCount, nodeCount: idMap.size }
    })

    // 8. Revalidate.
    revalidateCollectionPaths(source.slug)

    return {
      ok: true,
      data: {
        id: duplicate.id,
        slug: duplicate.slug,
        name: duplicate.name,
      },
    }
  } catch (err) {
    if (isUniqueViolation(err)) {
      return {
        ok: false,
        error: "A collection with that slug already exists. Try again.",
      }
    }

    console.error("Failed to duplicate collection:", err)
    return { ok: false, error: "Failed to duplicate collection" }
  }
}

/**
 * Re-parents a collection ("Move to…"). The subtree comes along for the ride,
 * since children point at their parent by id.
 *
 * The slug is deliberately left alone. Slugs encode the parent chain at
 * creation time (`parent-slug-child-slug`), but rewriting it here would break
 * every existing link to the collection and force a cascading re-slug of the
 * whole subtree. A slightly stale slug is the cheaper trade.
 */
export async function moveCollectionToParent(
  input: MoveCollectionToParentInput
): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = MoveCollectionToParentSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  const { collection, error } = await requireOwnedCollection(
    parsed.data.id,
    user.id
  )
  if (error || !collection) return { ok: false, error: error ?? "Not found" }

  const targetParentId = parsed.data.parentId

  if (targetParentId === collection.id) {
    return { ok: false, error: "A collection can't be moved into itself" }
  }

  if (targetParentId === collection.parentId) {
    return { ok: true, data: undefined } // already there, no-op
  }

  if (targetParentId) {
    const { collection: parent, error: parentError } =
      await requireOwnedCollection(targetParentId, user.id)
    if (parentError || !parent) {
      return { ok: false, error: "Destination collection not found" }
    }

    // Cycle guard: moving a collection under its own descendant would detach
    // that whole branch from the root and make it unreachable.
    const descendantIds = await collectDescendantIds(collection.id, user.id)
    if (descendantIds.has(targetParentId)) {
      return {
        ok: false,
        error: "You can't move a collection into one of its own subcollections",
      }
    }
  }

  const position = await nextSiblingPosition(user.id, targetParentId)

  await db
    .update(collections)
    .set({
      parentId: targetParentId,
      position,
      updatedAt: new Date(),
    })
    .where(eq(collections.id, collection.id))

  revalidateCollectionPaths(collection.slug)
  return { ok: true, data: undefined }
}

/** Tree + invalid drop targets for the "Move to…" picker. */
export async function getCollectionMoveTargets(input: {
  collectionId: string
}): Promise<
  ActionResult<{
    tree: CollectionTreeNode[]
    blockedIds: string[]
    currentParentId: string | null
  }>
> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = CollectionMoveTargetsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid input" }

  const { error } = await requireOwnedCollection(
    parsed.data.collectionId,
    user.id
  )
  if (error) return { ok: false, error }

  const data = await getMoveTargetTree({
    ownerId: user.id,
    collectionId: parsed.data.collectionId,
  })

  return { ok: true, data }
}

/**
 * One collection's full detail payload, fetched fresh by id.
 *
 * The details dialog drills down through nested collections, so it needs to
 * load each one on demand rather than reading a tree node it was handed: a node
 * from the page's tree carries no notes and goes stale the moment the collection
 * is edited, duplicated, or moved.
 */
export async function getCollectionOverview(input: {
  collectionId: string
  noteLimit?: number
}): Promise<ActionResult<CollectionOverview>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = CollectionOverviewSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid input" }

  const overview = await getOwnerCollectionOverview({
    ownerId: user.id,
    collectionId: parsed.data.collectionId,
    noteLimit: parsed.data.noteLimit,
  })

  // Null covers both "no such collection" and "not yours" — don't tell the
  // caller which, or a stranger's id becomes a existence check.
  if (!overview) return { ok: false, error: "Collection not found" }

  return { ok: true, data: overview }
}

/**
 * Search for notes to add to a collection, excluding ones already in it.
 * Adjust the base filter (currently: notes owned by the current user) if
 * OpenNotes lets people add any public note to their own collections.
 */
export async function searchAddableNotes(input: {
  collectionId: string
  query: string
}) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: "You must be signed in" }

  const existing = await db
    .select({ noteId: collectionNotes.noteId })
    .from(collectionNotes)
    .where(eq(collectionNotes.collectionId, input.collectionId))
  const excludeIds = existing.map((r) => r.noteId)

  //! sdafasdf
  const conditions = [eq(notes.contributorId, user.id)]
  if (input.query) conditions.push(ilike(notes.title, `%${input.query}%`))
  if (excludeIds.length > 0) conditions.push(notInArray(notes.id, excludeIds))

  const rows = await db
    .select({
      id: notes.id,
      title: notes.title,
      subject: notes.subject,
    })
    .from(notes)
    .where(and(...conditions))
    .limit(20)

  return { ok: true as const, data: rows }
}

export async function saveCollection(input: {
  collectionId: string
}): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = SaveCollectionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid input" }

  const collection = await getCollectionById(parsed.data.collectionId)
  if (!collection) return { ok: false, error: "Collection not found" }
  if (collection.ownerId === user.id) {
    return { ok: false, error: "You already own this collection" }
  }

  await db
    .insert(collectionSaves)
    .values({ userId: user.id, collectionId: collection.id })
    .onConflictDoNothing()

  revalidatePath(`/profile/collections/${collection.slug}`)
  revalidatePath("/profile/saved-collections")
  return { ok: true, data: undefined }
}

export async function unsaveCollection(input: {
  collectionId: string
}): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = SaveCollectionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid input" }

  await db
    .delete(collectionSaves)
    .where(
      and(
        eq(collectionSaves.userId, user.id),
        eq(collectionSaves.collectionId, parsed.data.collectionId)
      )
    )

  const collection = await getCollectionById(parsed.data.collectionId)
  revalidatePath(`/profile/collections/${collection?.slug ?? ""}`)
  revalidatePath("/profile/saved-collections")
  return { ok: true, data: undefined }
}
