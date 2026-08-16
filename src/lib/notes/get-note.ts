import { and, eq, sql } from "drizzle-orm"
import { db } from "@/db"
import { notes, users } from "@/db"
import { PublicNote } from "@/types/note"

export async function getPublishedNoteBySlug(
  slug: string
): Promise<PublicNote | null> {
  const [row] = await db
    .select({
      id: notes.id,
      slug: notes.slug,
      title: notes.title,
      description: notes.description,
      subject: notes.subject,
      grade: notes.grade,
      educationLevel: notes.educationLevel,
      course: notes.course,
      topic: notes.topic,
      academicYear: notes.academicYear,
      tags: notes.tags,
      pageCount: notes.pageCount,
      fileSizeBytes: notes.fileSizeBytes,
      filePath: notes.filePath,
      // viewCount: notes.viewCount,
      downloadCount: notes.downloadCount,
      publishedAt: notes.publishedAt,
      contributorId: users.id,
      contributorName: users.name,
      contributorUsername: users.username,
      contributorAvatarUrl: users.avatarUrl,
      contributorPublishedCount: sql<number>`(
        SELECT count(*)::int FROM notes n2
        WHERE n2.contributor_id = ${users.id} AND n2.status = 'PUBLISHED'
      )`,
    })
    .from(notes)
    .innerJoin(users, eq(notes.contributorId, users.id))
    .where(and(eq(notes.slug, slug), eq(notes.status, "PUBLISHED")))
    .limit(1)

  if (!row) return null

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    subject: row.subject,
    grade: row.grade,
    educationLevel: row.educationLevel as PublicNote["educationLevel"],
    course: row.course,
    topic: row.topic,
    academicYear: row.academicYear,
    tags: row.tags || [],
    pageCount: row.pageCount,
    fileSizeBytes: row.fileSizeBytes,
    filePath: row.filePath,
    // viewCount: row.viewCount,
    downloadCount: row.downloadCount,
    publishedAt: row.publishedAt ? new Date(row.publishedAt) : new Date(),
    contributor: {
      id: row.contributorId,
      name: row.contributorName,
      username: row.contributorUsername,
      avatarUrl: row.contributorAvatarUrl,
      publishedNoteCount: row.contributorPublishedCount,
    },
  }
}
