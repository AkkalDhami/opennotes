import { eq } from "drizzle-orm"

import { db, notes, NoteStatus } from "@/db"

export type ReportableNote = {
  id: string
  title: string
  status: NoteStatus
}

export async function getReportableNote(
  noteId: string
): Promise<ReportableNote | null> {
  const [note] = await db
    .select({
      id: notes.id,
      title: notes.title,
      status: notes.status,
    })
    .from(notes)
    .where(eq(notes.id, noteId))
    .limit(1)

  return note ?? null
}
