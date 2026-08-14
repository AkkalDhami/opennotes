import { env } from "@/configs/env";
import { db, notes } from "@/db";
import { eq } from "drizzle-orm";

export function getFileUrl(filePath: string) {
  return `${env.IMAGEKIT_URL_ENDPOINT}${env.IMAGEKIT_ID}${filePath}`
}

export async function getNoteBySlug(slug: string) {
  const [note] = await db.select().from(notes).where(eq(notes.slug, slug))

  if (!note) {
    return null
  }

  const fileUrl = getFileUrl(note.filePath)

  console.log({ fileUrl })

  // https://ik.imagekit.io/m1kboppu7/m1kboppu7/notes/20164ee7-a8ef-4fa7-b402-ab52fdebf65c/node-js-handbook-fa8bda2a-4d82-46da-a756-b8b4b053b60e_Ptymy4nA1y.pdf

  // https://ik.imagekit.io/m1kboppu7/notes/20164ee7-a8ef-4fa7-b402-ab52fdebf65c/node-js-handbook-fa8bda2a-4d82-46da-a756-b8b4b053b60e_Ptymy4nA1y.pdf?updatedAt=1786625136895

  return {
    ...note,
    fileUrl,
  }
}

// https://ik.imagekit.io/m1kboppu7/notes/20164ee7-a8ef-4fa7-b402-ab52fdebf65c/dsa-3a50670b-f228-4e23-b256-e90b302bccc4_K5mf1sqwd.pdf?updatedAt=1786624532894