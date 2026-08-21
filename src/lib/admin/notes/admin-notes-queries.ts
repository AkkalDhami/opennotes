"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getAdminNoteById } from "@/lib/admin/admin-notes"
import { AdminNoteDetail } from "@/types/note"

export async function fetchAdminNoteDetail(
  noteId: string
): Promise<AdminNoteDetail | null> {
  await requireAdmin()
  return getAdminNoteById(noteId)
}
