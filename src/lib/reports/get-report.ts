import { eq } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db, notes, reports, ReportType, users } from "@/db"

const reporterUsers = alias(users, "reporter_users")
const contributorUsers = alias(users, "contributor_users")
const reviewerUsers = alias(users, "reviewer_users")

export type ReportDetail = {
  id: string
  reason: ReportType["reason"]
  status: ReportType["status"]
  explanation: string | null
  createdAt: Date
  reviewedAt: Date | null
  resolutionNote: string | null
  note: {
    id: string
    slug: string
    title: string
    subject: string
    status: string
    publishedAt: Date | null
    contributor: {
      id: string
      name: string
      username: string
      avatar: string | null
    }
  }
  reporter: {
    id: string
    name: string
    username: string
    avatar?: string | null
  } | null
  reviewer: {
    id: string
    name: string
    username: string
    avatar?: string | null
  } | null
}

export async function getReportById(id: string): Promise<ReportDetail | null> {
  const [row] = await db
    .select({
      id: reports.id,
      reason: reports.reason,
      status: reports.status,
      explanation: reports.explanation,
      createdAt: reports.createdAt,
      reviewedAt: reports.reviewedAt,
      resolutionNote: reports.resolutionNote,

      noteId: notes.id,
      noteSlug: notes.slug,
      noteTitle: notes.title,
      noteSubject: notes.subject,
      noteStatus: notes.status,
      notePublishedAt: notes.publishedAt,

      contributorId: contributorUsers.id,
      contributorName: contributorUsers.name,
      contributorUsername: contributorUsers.username,

      reporterId: reporterUsers.id,
      reporterName: reporterUsers.name,
      reporterUsername: reporterUsers.username,
      reporterAvatar: reporterUsers.avatarUrl,

      reviewerId: reviewerUsers.id,
      reviewerName: reviewerUsers.name,
      reviewerUsername: reviewerUsers.username,
      reviewerAvatar: reviewerUsers.avatarUrl,
    })
    .from(reports)
    .innerJoin(notes, eq(reports.noteId, notes.id))
    .innerJoin(contributorUsers, eq(notes.contributorId, contributorUsers.id))
    .leftJoin(reporterUsers, eq(reports.reporterId, reporterUsers.id))
    .leftJoin(reviewerUsers, eq(reports.reviewedBy, reviewerUsers.id))
    .where(eq(reports.id, id))
    .limit(1)

  if (!row) return null

  return {
    id: row.id,
    reason: row.reason,
    status: row.status,
    explanation: row.explanation,
    createdAt: row.createdAt,
    reviewedAt: row.reviewedAt,
    resolutionNote: row.resolutionNote,
    note: {
      id: row.noteId,
      slug: row.noteSlug,
      title: row.noteTitle,
      subject: row.noteSubject,
      status: row.noteStatus,
      publishedAt: row.notePublishedAt,
      contributor: {
        id: row.contributorId,
        name: row.contributorName,
        username: row.contributorUsername,
        avatar: row.reporterAvatar,
      },
    },
    reporter: row.reporterId
      ? {
          id: row.reporterId,
          name: row.reporterName!,
          username: row.reporterUsername!,
          avatar: row.reporterAvatar,
        }
      : null,
    reviewer: row.reviewerId
      ? {
          id: row.reviewerId,
          name: row.reviewerName!,
          username: row.reviewerUsername!,
          avatar: row.reviewerAvatar,
        }
      : null,
  }
}
