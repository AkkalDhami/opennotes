import { env } from "@/configs/env"
import { db, notes } from "@/db"
import { resolveNoteFileUrl } from "@/lib/notes/file-url"
import { eq } from "drizzle-orm"

export function getFileUrl(filePath: string) {
  return `${env.IMAGEKIT_URL_ENDPOINT}${env.IMAGEKIT_ID}${filePath}`
}

export async function getNoteBySlug(slug: string) {
  const [note] = await db.select().from(notes).where(eq(notes.slug, slug))

  if (!note) {
    return null
  }

  const fileUrl = await resolveNoteFileUrl(note.fileKey)

  return {
    ...note,
    fileUrl,
  }
}
