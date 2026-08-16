import { index, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core"
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
    ...timestamps,
  },
  (t) => [
    index("reports_note_idx").on(t.noteId),
    index("reports_status_idx").on(t.status),
  ]
)

export type ReportType = typeof reports.$inferSelect
