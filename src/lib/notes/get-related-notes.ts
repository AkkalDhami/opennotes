import { and, desc, eq, ne, or, sql } from "drizzle-orm"
import { db } from "@/db"
import { notes, users } from "@/db"
import type { PublicNote } from "@/types/note"

interface GetRelatedNotesArgs {
  noteId: string
  subject: string
  grade: string | null
  topic: string | null
  tags: string[]
  limit?: number
}

/**
 * Finds related published notes by same subject, grade, topic, or
 * overlapping tags, excluding the current note. Ranked by how many of
 * those signals match, then recency.
 */
export async function getRelatedNotes({
  noteId,
  subject,
  grade,
  topic,
  tags,
  limit = 6,
}: GetRelatedNotesArgs): Promise<PublicNote[]> {
  const normalizedGrade = grade || null
  const normalizedTopic = topic || null

  const tagOverlap =
    tags.length > 0
      ? sql`${notes.tags} && ARRAY[${sql.join(
          tags.map((t) => sql`${t}`),
          sql`, `
        )}]::text[]`
      : sql`false`

  const matchScore = sql<number>`(
    (CASE WHEN ${notes.subject}::text = ${subject} THEN 1 ELSE 0 END) +
    (CASE WHEN ${normalizedGrade}::text IS NOT NULL AND ${notes.grade}::text = ${normalizedGrade}::text THEN 1 ELSE 0 END) +
    (CASE WHEN ${normalizedTopic}::text IS NOT NULL AND ${notes.topic}::text = ${normalizedTopic}::text THEN 1 ELSE 0 END) +
    (CASE WHEN ${tagOverlap} THEN 1 ELSE 0 END)
  )`

  const rows = await db
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
      downloadCount: notes.downloadCount,
      publishedAt: notes.publishedAt,
      contributorId: users.id,
      contributorName: users.name,
      contributorUsername: users.username,
      contributorAvatarUrl: users.avatarUrl,
      filePath: notes.filePath,
      score: matchScore,
    })
    .from(notes)
    .innerJoin(users, eq(notes.contributorId, users.id))
    .where(
      and(
        eq(notes.status, "PUBLISHED"),
        ne(notes.id, noteId),
        or(
          eq(notes.subject, subject),
          normalizedGrade ? eq(notes.grade, normalizedGrade) : sql`false`,
          normalizedTopic ? eq(notes.topic, normalizedTopic) : sql`false`,
          tagOverlap
        )
      )
    )
    .orderBy(desc(matchScore), desc(notes.publishedAt))
    .limit(limit)

  return rows.map((row) => ({
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
    fileType: "PDF",
    pageCount: row.pageCount,
    fileSizeBytes: row.fileSizeBytes,
    downloadCount: row.downloadCount,
    filePath: row.filePath,
    publishedAt: row.publishedAt ? new Date(row.publishedAt) : new Date(),
    contributor: {
      id: row.contributorId,
      name: row.contributorName,
      username: row.contributorUsername,
      avatarUrl: row.contributorAvatarUrl,
    },
  }))
}

/**
 *
 * Finds related published notes by same contributor, excluding the current note
 */

export async function getRelatedNotesByContributor({
  contributorId,
  limit = 12,
}: {
  contributorId: string
  limit?: number
}): Promise<PublicNote[]> {
  const rows = await db
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
      downloadCount: notes.downloadCount,
      publishedAt: notes.publishedAt,
      contributorId: users.id,
      contributorName: users.name,
      contributorUsername: users.username,
      contributorAvatarUrl: users.avatarUrl,
      filePath: notes.filePath,
    })
    .from(notes)
    .innerJoin(users, eq(notes.contributorId, users.id))
    .where(
      and(eq(notes.status, "PUBLISHED"), eq(notes.contributorId, contributorId))
    )
    .orderBy(desc(notes.publishedAt))
    .limit(limit)

  return rows.map((row) => ({
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
    fileType: "PDF",
    pageCount: row.pageCount,
    fileSizeBytes: row.fileSizeBytes,
    downloadCount: row.downloadCount,
    filePath: row.filePath,
    publishedAt: row.publishedAt ? new Date(row.publishedAt) : new Date(),
    contributor: {
      id: row.contributorId,
      name: row.contributorName,
      username: row.contributorUsername,
      avatarUrl: row.contributorAvatarUrl,
    },
  }))
}
