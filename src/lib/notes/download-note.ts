"use server"

import { db, notes } from "@/db"
import { eq, and, sql } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { getFileUrl } from "@/utils/get-file-url"

export async function downloadNote(noteId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "Unauthorized.",
      }
    }

    const [note] = await db
      .select({
        id: notes.id,
        filePath: notes.filePath,
        originalFileName: notes.originalFileName,
      })
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.status, "PUBLISHED")))

    if (!note) {
      return {
        success: false,
        message: "Note not found.",
      }
    }

    // Increment download count atomically
    await db
      .update(notes)
      .set({
        downloadCount: sql`${notes.downloadCount} + 1`,
      })
      .where(eq(notes.id, note.id))

    const fileUrl = getFileUrl(note.filePath)

    return {
      success: true,
      url: fileUrl,
      fileName: note.originalFileName,
    }
  } catch (error) {
    console.error("[downloadNote]", error)

    return {
      success: false,
      message: "Unable to download note.",
    }
  }
}
