"use server"

import { and, eq, inArray } from "drizzle-orm"

import { getCurrentUser } from "@/lib/auth/get-current-user"
import { db } from "@/db"
import { collections, collectionNotes, notes } from "@/db"
import {
  CollectionTreeNode,
  getOwnerCollectionTreeWithNoteMembership,
} from "./collection-queries"
import { ActionResult, revalidateCollectionPaths } from "./collections"
import {
  AddNoteToCollectionsInput,
  AddNoteToCollectionsSchema,
  CollectionPickerDataSchema,
} from "@/validations/collection"

export async function getCollectionPickerData(input: {
  noteId: string
}): Promise<
  ActionResult<{ tree: CollectionTreeNode[]; noteCollectionIds: string[] }>
> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = CollectionPickerDataSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid input" }

  const data = await getOwnerCollectionTreeWithNoteMembership({
    ownerId: user.id,
    noteId: parsed.data.noteId,
  })

  return { ok: true, data }
}

/**
 * Adds a note to one or more of the current user's collections in a single
 * operation:
 *
 *   add note -> collection A
 *   add note -> collection B
 *   add note -> collection C
 *
 * This only ever adds memberships — it never removes an existing one, and
 * a collection the note already belongs to is silently skipped rather than
 * treated as an error. Use a dedicated "Move to collection" action if you
 * need to change membership instead of adding to it.
 */
export async function addNoteToCollections(
  input: AddNoteToCollectionsInput
): Promise<ActionResult<{ addedCount: number; alreadyExistingCount: number }>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "You must be signed in" }

  const parsed = AddNoteToCollectionsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  const { noteId, collectionIds } = parsed.data

  const [note] = await db
    .select({ id: notes.id })
    .from(notes)
    .where(eq(notes.id, noteId))
    .limit(1)

  if (!note) {
    return { ok: false, error: "This note is no longer available." }
  }

  // Every selected collection must belong to the current user. The server
  // is the final authority — never trust collection ids supplied by the
  // client beyond using them to look this up.
  const owned = await db
    .select({ id: collections.id })
    .from(collections)
    .where(
      and(
        eq(collections.ownerId, user.id),
        inArray(collections.id, collectionIds)
      )
    )

  if (owned.length !== collectionIds.length) {
    return {
      ok: false,
      error: "You cannot add notes to one or more selected collections.",
    }
  }

  const result = await db.transaction(async (tx) => {
    const existing = await tx
      .select({ collectionId: collectionNotes.collectionId })
      .from(collectionNotes)
      .where(
        and(
          eq(collectionNotes.noteId, noteId),
          inArray(collectionNotes.collectionId, collectionIds)
        )
      )

    const existingIds = new Set(existing.map((row) => row.collectionId))
    const toInsert = collectionIds.filter((id) => !existingIds.has(id))

    if (toInsert.length > 0) {
      await tx
        .insert(collectionNotes)
        .values(toInsert.map((collectionId) => ({ collectionId, noteId })))
        .onConflictDoNothing()
    }

    return {
      addedCount: toInsert.length,
      alreadyExistingCount: existingIds.size,
    }
  })

  revalidateCollectionPaths()

  return { ok: true, data: result }
}
