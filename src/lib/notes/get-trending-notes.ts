import "server-only"

import { db, downloads, notes, users } from "@/db"
import { and, eq, gte, sql } from "drizzle-orm"
import { PublicNote } from "@/types/note"
import { getCurrentUser } from "@/lib/auth/get-current-user"

const DEFAULT_LIMIT = 12
const TRENDING_DAYS = 30

export async function getTrendingNotes(
  limit = DEFAULT_LIMIT
): Promise<PublicNote[]> {
  try {
    const since = new Date()

    since.setDate(since.getDate() - TRENDING_DAYS)

    const user = await getCurrentUser()

    const rows = await db
      .select({
        id: notes.id,
        slug: notes.slug,
        title: notes.title,
        description: notes.description,
        subject: notes.subject,
        category: notes.category,
        educationLevel: notes.educationLevel,
        course: notes.course,
        grade: notes.grade,
        topic: notes.topic,
        academicYear: notes.academicYear,
        originalFileName: notes.originalFileName,
        fileSizeBytes: notes.fileSizeBytes,
        pageCount: notes.pageCount,
        downloadCount: notes.downloadCount,
        publishedAt: notes.publishedAt,
        lastModifiedAt: notes.updatedAt,
        createdAt: notes.createdAt,
        tags: notes.tags,
        filePath: notes.filePath,

        contributorId: users.id,
        contributorName: users.name,
        contributorUsername: users.username,
        contributorAvatarUrl: users.avatarUrl,
        sourceType: notes.sourceType,
        sourceUrl: notes.sourceUrl,
        originalAuthor: notes.originalAuthor,
        // Downloads during the last 30 days
        viewCount: notes.viewCount,
        recentDownloads: sql<number>`
          COUNT(${downloads.id})
        `.as("recent_downloads"),

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
      .leftJoin(
        downloads,
        and(eq(downloads.noteId, notes.id), gte(downloads.createdAt, since))
      )
      .where(eq(notes.status, "PUBLISHED"))
      .groupBy(notes.id, users.id)
      .orderBy(
        sql`
          (
            COUNT(${downloads.id}) * 5
            +
            LOG(GREATEST(${notes.downloadCount}, 1) + 1) * 2
            +
            CASE
              WHEN ${notes.publishedAt} >= NOW() - INTERVAL '7 days'
                THEN 3
              WHEN ${notes.publishedAt} >= NOW() - INTERVAL '30 days'
                THEN 1
              ELSE 0
            END
          ) DESC
        `
      )
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
      tags: row.tags ?? [],

      fileType: "PDF",
      pageCount: row.pageCount,
      fileSizeBytes: row.fileSizeBytes,
      filePath: row.filePath,

      downloadCount: row.downloadCount,
      viewCount: row.viewCount,
      isBookmarked: row.isBookmarked,

      publishedAt: row.publishedAt ? new Date(row.publishedAt) : new Date(),
      lastModifiedAt: row.lastModifiedAt ? new Date(row.lastModifiedAt) : null,
      originalAuthor: row.originalAuthor,
      sourceType: row.sourceType,
      sourceUrl: row.sourceUrl,
      contributor: {
        id: row.contributorId,
        name: row.contributorName,
        username: row.contributorUsername,
        avatarUrl: row.contributorAvatarUrl,
      },
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}
