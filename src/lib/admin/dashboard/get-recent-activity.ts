import { cache } from "react"
import { desc, eq, isNotNull } from "drizzle-orm"

import { db } from "@/db"
import { notes } from "@/db"
import { reports } from "@/db"
import { users } from "@/db"
export type ActivityEvent =
  | { type: "USER_JOINED"; id: string; actor: string; timestamp: Date }
  | {
      type: "NOTE_SUBMITTED"
      id: string
      actor: string
      noteTitle: string
      timestamp: Date
    }
  | {
      type: "NOTE_PUBLISHED"
      id: string
      actor: string
      noteTitle: string
      timestamp: Date
    }
  | {
      type: "NOTE_REJECTED"
      id: string
      actor: string
      noteTitle: string
      timestamp: Date
    }
  | {
      type: "NOTE_REMOVED"
      id: string
      actor: string
      noteTitle: string
      timestamp: Date
    }
  | {
      type: "REPORT_SUBMITTED"
      id: string
      actor: string | null
      noteTitle: string
      timestamp: Date
    }

const PER_SOURCE_LIMIT = 8

/**
 * There's no dedicated activity/audit-log table in the schema yet, so this
 * synthesizes a feed from existing timestamped rows (users, notes, reports)
 * and merges them in memory. Every source query is small and LIMIT-ed, so
 * this stays cheap even as the platform grows — if activity volume gets
 * large, replace this with a real `activity_log` table written to at the
 * point each event happens, instead of inferring events from row timestamps.
 *
 * Note: "note submitted" uses `createdAt` as a best-effort proxy for
 * submission time. If notes can sit in DRAFT for a long time before being
 * submitted for review, consider adding a dedicated `submittedAt` column.
 */
export const getRecentActivity = cache(
  async (limit = 10): Promise<ActivityEvent[]> => {
    const [joined, submitted, published, rejected, removed, reported] =
      await Promise.all([
        db
          .select({
            id: users.id,
            name: users.name,
            createdAt: users.createdAt,
          })
          .from(users)
          .orderBy(desc(users.createdAt))
          .limit(PER_SOURCE_LIMIT),

        db
          .select({
            id: notes.id,
            title: notes.title,
            createdAt: notes.createdAt,
            contributor: users.name,
          })
          .from(notes)
          .innerJoin(users, eq(notes.contributorId, users.id))
          .orderBy(desc(notes.createdAt))
          .limit(PER_SOURCE_LIMIT),

        db
          .select({
            id: notes.id,
            title: notes.title,
            publishedAt: notes.publishedAt,
            contributor: users.name,
          })
          .from(notes)
          .innerJoin(users, eq(notes.contributorId, users.id))
          .where(isNotNull(notes.publishedAt))
          .orderBy(desc(notes.publishedAt))
          .limit(PER_SOURCE_LIMIT),

        db
          .select({
            id: notes.id,
            title: notes.title,
            updatedAt: notes.updatedAt,
            contributor: users.name,
          })
          .from(notes)
          .innerJoin(users, eq(notes.contributorId, users.id))
          .where(eq(notes.status, "REJECTED"))
          .orderBy(desc(notes.updatedAt))
          .limit(PER_SOURCE_LIMIT),

        db
          .select({
            id: notes.id,
            title: notes.title,
            updatedAt: notes.updatedAt,
            contributor: users.name,
          })
          .from(notes)
          .innerJoin(users, eq(notes.contributorId, users.id))
          .where(eq(notes.status, "REMOVED"))
          .orderBy(desc(notes.updatedAt))
          .limit(PER_SOURCE_LIMIT),

        db
          .select({
            id: reports.id,
            noteTitle: notes.title,
            createdAt: reports.createdAt,
            reporter: users.name,
          })
          .from(reports)
          .innerJoin(notes, eq(reports.noteId, notes.id))
          .leftJoin(users, eq(reports.reporterId, users.id))
          .orderBy(desc(reports.createdAt))
          .limit(PER_SOURCE_LIMIT),
      ])

    const events: ActivityEvent[] = [
      ...joined.map((u) => ({
        type: "USER_JOINED" as const,
        id: `user-${u.id}`,
        actor: u.name,
        timestamp: u.createdAt,
      })),
      ...submitted.map((row) => ({
        type: "NOTE_SUBMITTED" as const,
        id: `submitted-${row.id}`,
        actor: row.contributor,
        noteTitle: row.title,
        timestamp: row.createdAt,
      })),
      ...published.map((row) => ({
        type: "NOTE_PUBLISHED" as const,
        id: `published-${row.id}`,
        actor: row.contributor,
        noteTitle: row.title,
        timestamp: row.publishedAt as Date,
      })),
      ...rejected.map((row) => ({
        type: "NOTE_REJECTED" as const,
        id: `rejected-${row.id}`,
        actor: row.contributor,
        noteTitle: row.title,
        timestamp: row.updatedAt,
      })),
      ...removed.map((row) => ({
        type: "NOTE_REMOVED" as const,
        id: `removed-${row.id}`,
        actor: row.contributor,
        noteTitle: row.title,
        timestamp: row.updatedAt,
      })),
      ...reported.map((row) => ({
        type: "REPORT_SUBMITTED" as const,
        id: `report-${row.id}`,
        actor: row.reporter,
        noteTitle: row.noteTitle,
        timestamp: row.createdAt,
      })),
    ]

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }
)
