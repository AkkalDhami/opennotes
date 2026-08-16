import "server-only"

import { db, notes, downloads } from "@/db"
import { count, eq, sql } from "drizzle-orm"

export type ContributorStats = {
  totalNotes: number
  totalContributions: number
  publishedNotes: number
  pendingNotes: number
  rejectedNotes: number
  removedNotes: number
  totalDownloads: number
}

export async function getContributorStats(
  userId: string
): Promise<ContributorStats> {
  const [result] = await db
    .select({
      totalNotes: count(notes.id),

      totalContributions: count(notes.id),

      published: sql<number>`
        count(*) filter (where ${notes.status} = 'PUBLISHED')
      `,

      pending: sql<number>`
        count(*) filter (where ${notes.status} = 'PENDING_REVIEW')
      `,

      rejected: sql<number>`
        count(*) filter (where ${notes.status} = 'REJECTED')
      `,

      removed: sql<number>`
        count(*) filter (where ${notes.status} = 'REMOVED')
      `,

      totalDownloads: sql<number>`
        coalesce((
          select count(*)
          from ${downloads}
          inner join ${notes} n
            on n.id = ${downloads.noteId}
          where n.contributor_id = ${userId}
        ), 0)
      `,
    })
    .from(notes)
    .where(eq(notes.contributorId, userId))

  return {
    totalNotes: Number(result?.totalNotes ?? 0),
    totalContributions: Number(result?.totalContributions ?? 0),
    publishedNotes: Number(result?.published ?? 0),
    pendingNotes: Number(result?.pending ?? 0),
    rejectedNotes: Number(result?.rejected ?? 0),
    removedNotes: Number(result?.removed ?? 0),
    totalDownloads: Number(result?.totalDownloads ?? 0),
  }
}

export type ContributorRecentActivity = {
  id: string
  title: string
  status: string
  createdAt: Date
  publishedAt: Date
  rejectionReason?: string | null
}

export async function getContributorRecentActivity(
  userId: string,
  limit = 10
): Promise<ContributorRecentActivity[]> {
  const result = await db
    .select({
      id: notes.id,
      title: notes.title,
      status: notes.status,
      createdAt: notes.createdAt,
      publishedAt: notes.publishedAt,
      rejectionReason: notes.rejectionReason,
    })
    .from(notes)
    .where(eq(notes.contributorId, userId))
    .orderBy(sql`coalesce(${notes.publishedAt}, ${notes.createdAt}) desc`)
    .limit(limit)

  return result.map((note) => ({
    id: note.id,
    title: note.title,
    status: note.status,
    createdAt: note.createdAt,
    publishedAt: note.publishedAt ? new Date(note.publishedAt) : new Date(),
    rejectionReason: note.rejectionReason,
  }))
}
