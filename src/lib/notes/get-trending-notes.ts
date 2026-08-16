import "server-only"

import { db, downloads, notes, users } from "@/db"
import { and, eq, gte, sql } from "drizzle-orm"
import { PublicNote } from "@/types/note"

const DEFAULT_LIMIT = 12
const TRENDING_DAYS = 30

export async function getTrendingNotes(
  limit = DEFAULT_LIMIT
): Promise<PublicNote[]> {
  try {
    const since = new Date()

    since.setDate(since.getDate() - TRENDING_DAYS)

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
        createdAt: notes.createdAt,
        tags: notes.tags,
        filePath: notes.filePath,

        contributorId: users.id,
        contributorName: users.name,
        contributorUsername: users.username,
        contributorAvatarUrl: users.avatarUrl,

        // Downloads during the last 30 days
        recentDownloads: sql<number>`
          COUNT(${downloads.id})
        `.as("recent_downloads"),
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

      publishedAt: row.publishedAt ? new Date(row.publishedAt) : new Date(),

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
