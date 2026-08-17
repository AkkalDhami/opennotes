import { cache } from "react"
import { desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { notes, type NoteStatus } from "@/db"
import { users } from "@/db"

export type RecentNote = {
  id: string
  slug: string
  title: string
  subject: string
  status: NoteStatus
  downloadCount: number
  createdAt: Date
  contributorId: string
  contributorName: string
}

export const getRecentNotes = cache(
  async (limit = 10): Promise<RecentNote[]> => {
    return db
      .select({
        id: notes.id,
        slug: notes.slug,
        title: notes.title,
        subject: notes.subject,
        status: notes.status,
        downloadCount: notes.downloadCount,
        createdAt: notes.createdAt,
        contributorId: users.id,
        contributorName: users.name,
      })
      .from(notes)
      .innerJoin(users, eq(notes.contributorId, users.id))
      .orderBy(desc(notes.createdAt))
      .limit(limit)
  }
)
