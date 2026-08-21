import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { users } from "./user.schema"
import { notes } from "./note.schema"
import { timestamps } from "./schema.helper"

export const reportReasonEnum = pgEnum("report_reason", [
  "COPYRIGHT",
  "SPAM",
  "INCORRECT",
  "OFFENSIVE",
  "MALWARE",
  "DUPLICATE",
  "OTHER",
])

export const reportStatusEnum = pgEnum("report_status", [
  "OPEN",
  "DISMISSED",
  "RESOLVED",
])

export const reports = pgTable(
  "reports",
  {
    id: uuid().defaultRandom().primaryKey(),

    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),

    reporterId: uuid("reporter_id").references(() => users.id),

    reason: reportReasonEnum("reason").notNull(),

    explanation: text("explanation"),

    status: reportStatusEnum("status").notNull().default("OPEN"),

    reviewedBy: uuid("reviewed_by").references(() => users.id),

    resolutionNote: text("resolution_note"),

    reviewedAt: timestamp("reviewed_at"),

    reporterIpHash: varchar("reporter_ip_hash", { length: 64 }),

    ...timestamps,
  },
  (t) => [
    index("reports_note_idx").on(t.noteId),
    index("reports_status_idx").on(t.status),
    index("reports_reporter_idx").on(t.reporterId),
    index("reports_reviewed_by_idx").on(t.reviewedBy),
    index("reports_created_at_idx").on(t.createdAt),

    uniqueIndex("reports_reporter_note_idx").on(t.reporterId, t.noteId),
  ]
)

export type ReportType = typeof reports.$inferSelect
export type ReportReasonType = (typeof reportReasonEnum.enumValues)[number]
