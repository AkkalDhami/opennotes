"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db, notes } from "@/db"
import { ReportActionResult } from "./reports"
import { requireAdmin } from "@/lib/auth/require-admin"

const removeNoteSchema = z.object({
  noteId: z.uuid(),
})

export async function removeReportedNote(
  input: unknown
): Promise<ReportActionResult> {
  const parsed = removeNoteSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "This note could not be identified.",
    }
  }

  await requireAdmin()

  try {
    const updated = await db
      .update(notes)
      .set({ status: "REMOVED" })
      .where(eq(notes.id, parsed.data.noteId))
      .returning({ id: notes.id })

    if (updated.length === 0) {
      return {
        success: false,
        code: "NOTE_NOT_FOUND",
        message: "This note could not be found.",
      }
    }

    revalidatePath("/admin/reports")
    revalidatePath("/admin/notes")

    return { success: true, message: "Note removed." }
  } catch (error) {
    console.error("[reports] failed to remove reported note", error)
    return {
      success: false,
      code: "SERVER_ERROR",
      message: "We couldn't remove this note. Please try again.",
    }
  }
}
