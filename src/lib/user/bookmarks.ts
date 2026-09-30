"use server"

import { and, count, eq } from "drizzle-orm"

import { db } from "@/db"
import { bookmarks, notes } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { revalidatePath } from "next/cache"

export async function getContributorBookmarkCount(
  contributorId: string
): Promise<number> {
  const [result] = await db
    .select({
      count: count(),
    })
    .from(bookmarks)
    .innerJoin(notes, eq(bookmarks.noteId, notes.id))
    .where(
      and(eq(notes.contributorId, contributorId), eq(notes.status, "PUBLISHED"))
    )

  return result?.count ?? 0
}

export async function addBookmark(noteId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to bookmark notes.",
    }
  }

  const [note] = await db
    .select({
      id: notes.id,
    })
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.status, "PUBLISHED")))
    .limit(1)

  if (!note) {
    return {
      success: false,
      message: "Note not found.",
    }
  }

  await db
    .insert(bookmarks)
    .values({
      userId: user.id,
      noteId: note.id,
    })
    .onConflictDoNothing()

  return {
    success: true,
    bookmarked: true,
  }
}

export async function removeBookmark(noteId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to remove bookmarks.",
    }
  }

  await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.noteId, noteId)))

  revalidatePath("/profile/saved-notes")

  return {
    success: true,
    bookmarked: false,
  }
}
