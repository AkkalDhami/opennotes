import { and, eq, sql } from "drizzle-orm"
import { db } from "@/db"
import { notes, users } from "@/db"
import { PublicNote } from "@/types/note"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export async function getPublishedNoteBySlug(
  slug: string
): Promise<PublicNote | null> {
  const user = await getCurrentUser()

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

      sourceType: notes.sourceType,
      sourceUrl: notes.sourceUrl,
      originalAuthor: notes.originalAuthor,

      downloadCount: notes.downloadCount,
      viewCount: notes.viewCount,
      publishedAt: notes.publishedAt,
      contributorId: users.id,
      contributorName: users.name,
      contributorUsername: users.username,
      contributorAvatarUrl: users.avatarUrl,
      lastModifiedAt: notes.updatedAt,

      contributorPublishedCount: sql<number>`(
        SELECT count(*)::int FROM notes n2
        WHERE n2.contributor_id = ${users.id} AND n2.status = 'PUBLISHED'
      )`,

      isBookmarked: user
        ? sql<boolean>`EXISTS (
          SELECT 1
          FROM bookmarks b
          WHERE b.note_id = ${notes.id}
            AND b.user_id = ${user.id}
        )`
        : sql<boolean>`false`,
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

    sourceType: row.sourceType,
    sourceUrl: row.sourceUrl,
    originalAuthor: row.originalAuthor,

    isBookmarked: row.isBookmarked,

    downloadCount: row.downloadCount,
    viewCount: row.viewCount,
    publishedAt: row.publishedAt ? new Date(row.publishedAt) : new Date(),
    lastModifiedAt: row.lastModifiedAt ? new Date(row.lastModifiedAt) : null,
    contributor: {
      id: row.contributorId,
      name: row.contributorName,
      username: row.contributorUsername,
      avatarUrl: row.contributorAvatarUrl,
      publishedNoteCount: row.contributorPublishedCount,
    },
  }
}
