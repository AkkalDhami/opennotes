import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { users } from "./user.schema"
import { timestamps } from "./schema.helper"

export const processingStatusEnum = pgEnum("processing_status", [
  "PROCESSING",
  "READY",
  "FAILED",
])

export const noteStatusEnum = pgEnum("note_status", [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
  "REMOVED",
])

export const notes = pgTable(
  "notes",
  {
    id: uuid().defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    contributorId: uuid("contributor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subject: varchar("subject").notNull(),
    category: varchar("category").notNull(),

    educationLevel: varchar("education_level", { length: 64 }).notNull(),
    course: varchar("course", { length: 64 }).notNull().default("Unknown"),
    grade: varchar("grade", { length: 64 }).notNull(),
    topic: varchar("topic", { length: 128 }),
    academicYear: varchar("academic_year", { length: 16 }),

    originalFileName: varchar("original_file_name", {
      length: 255,
    }),
    filePath: text("file_path").notNull(),
    fileKey: text("file_key").notNull(), // storage object key, never a raw filename
    fileHash: varchar("file_hash", { length: 64 }).notNull(), // sha-256, for dup detection
    fileSizeBytes: integer("file_size_bytes").notNull(),
    pageCount: integer("page_count"),
    processingStatus: processingStatusEnum("processing_status")
      .notNull()
      .default("PROCESSING"),

    status: noteStatusEnum("status").notNull().default("PENDING_REVIEW"),
    downloadCount: integer("download_count").notNull().default(0),
    rejectionReason: text("rejection_reason"),

    ...timestamps,
    publishedAt: timestamp("published_at"),
    tags: text("tags").array().default([]),
  },
  (t) => [
    uniqueIndex("notes_slug_idx").on(t.slug),
    index("notes_status_idx").on(t.status),
    index("notes_created_at_idx").on(t.createdAt),
    index("notes_subject_idx").on(t.subject),
    index("notes_category_idx").on(t.category),
    index("notes_contributor_idx").on(t.contributorId),
    index("notes_file_hash_idx").on(t.fileHash),
  ]
)

export type NoteType = typeof notes.$inferSelect
export type NewNoteType = typeof notes.$inferInsert
export type NoteStatus = NoteType["status"]