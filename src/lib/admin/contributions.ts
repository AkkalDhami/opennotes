"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, notes } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import {
  canTransition,
  getRevalidatePaths,
  type ActionResult,
} from "@/lib/notes/moderation"
import { rejectContributionSchema } from "@/validations/contribution-filter"

async function requireAdminUser() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return user
}

async function fetchNoteOrThrow(noteId: string) {
  const [note] = await db.select().from(notes).where(eq(notes.id, noteId))
  if (!note) {
    throw new Error("Note not found")
  }
  return note
}

function revalidateAll(noteId: string) {
  for (const path of getRevalidatePaths(noteId)) {
    revalidatePath(path)
  }
}

export async function approveContribution(
  noteId: string
): Promise<ActionResult> {
  try {
    await requireAdminUser()

    if (!noteId || typeof noteId !== "string") {
      return { success: false, error: "Invalid note ID." }
    }

    const note = await fetchNoteOrThrow(noteId)

    if (!canTransition(note.status, "PUBLISHED")) {
      return {
        success: false,
        error: `Cannot approve a contribution with status "${note.status}".`,
      }
    }

    await db
      .update(notes)
      .set({ status: "PUBLISHED", publishedAt: new Date() })
      .where(eq(notes.id, noteId))

    revalidateAll(noteId)

    return { success: true, message: "Contribution approved successfully." }
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error) }
  }
}

export async function rejectContribution(
  noteId: string,
  reason: string
): Promise<ActionResult> {
  try {
    await requireAdminUser()

    if (!noteId || typeof noteId !== "string") {
      return { success: false, error: "Invalid note ID." }
    }

    const parsed = rejectContributionSchema.safeParse({ reason })
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid reason.",
      }
    }

    const note = await fetchNoteOrThrow(noteId)

    if (!canTransition(note.status, "REJECTED")) {
      return {
        success: false,
        error: `Cannot reject a contribution with status "${note.status}".`,
      }
    }

    await db
      .update(notes)
      .set({ status: "REJECTED", rejectionReason: parsed.data.reason })
      .where(eq(notes.id, noteId))

    revalidateAll(noteId)

    return { success: true, message: "Contribution rejected." }
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error) }
  }
}

export async function removeContribution(
  noteId: string
): Promise<ActionResult> {
  try {
    await requireAdminUser()

    if (!noteId || typeof noteId !== "string") {
      return { success: false, error: "Invalid note ID." }
    }

    const note = await fetchNoteOrThrow(noteId)

    if (!canTransition(note.status, "REMOVED")) {
      return {
        success: false,
        error: `Cannot remove a contribution with status "${note.status}".`,
      }
    }

    await db
      .update(notes)
      .set({ status: "REMOVED" })
      .where(eq(notes.id, noteId))

    revalidateAll(noteId)

    return { success: true, message: "Contribution removed." }
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error) }
  }
}

export async function restoreContribution(
  noteId: string
): Promise<ActionResult> {
  try {
    await requireAdminUser()

    if (!noteId || typeof noteId !== "string") {
      return { success: false, error: "Invalid note ID." }
    }

    const note = await fetchNoteOrThrow(noteId)

    if (!canTransition(note.status, "PUBLISHED")) {
      return {
        success: false,
        error: `Cannot restore a contribution with status "${note.status}".`,
      }
    }

    await db
      .update(notes)
      .set({ status: "PUBLISHED", publishedAt: new Date() })
      .where(eq(notes.id, noteId))

    revalidateAll(noteId)

    return { success: true, message: "Contribution published successfully." }
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error) }
  }
}

function toSafeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "Unauthorized") {
    return "You are not authorized to perform this action."
  }
  if (error instanceof Error && error.message === "Note not found") {
    return "This contribution no longer exists."
  }

  console.error("[admin/contributions] Unexpected error:", error)
  return "Something went wrong. Please try again."
}
