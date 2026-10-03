"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db, notes } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import type { ActionResult } from "@/lib/notes/moderation"

export async function submitDraftContribution(
  noteId: string
): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "You must be signed in to submit a note." }
  }
  if (typeof noteId !== "string" || !noteId.trim()) {
    return { success: false, error: "Invalid note ID." }
  }

  const [submitted] = await db
    .update(notes)
    .set({
      status: "PENDING_REVIEW",
      rejectionReason: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(notes.id, noteId),
        eq(notes.contributorId, user.id),
        eq(notes.status, "DRAFT")
      )
    )
    .returning({ id: notes.id })

  if (!submitted) {
    return {
      success: false,
      error: "This draft is unavailable or has already been submitted.",
    }
  }

  revalidatePath("/profile/contributions")
  revalidatePath(`/profile/contributions/${noteId}`)
  revalidatePath("/admin/contributions")
  revalidatePath("/admin/notes")

  return { success: true, message: "Your note was submitted for review." }
}
