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
import { timestamps, tsvector } from "./schema.helper"

export const NOTE_PROCESSING_STATUSES = [
  "PROCESSING",
  "READY",
  "FAILED",
] as const

export const processingStatusEnum = pgEnum(
  "processing_status",
  NOTE_PROCESSING_STATUSES
)

export const NOTE_STATUS = [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
  "REMOVED",
] as const

export const noteStatusEnum = pgEnum("note_status", NOTE_STATUS)

export const NOTE_SOURCES = [
  "ORIGINAL",
  "PERMISSION_GRANTED",
  "OPEN_LICENSE",
  "PUBLIC_DOMAIN",
] as const

export const noteSourceTypeEnum = pgEnum("note_source_type", NOTE_SOURCES)

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

    sourceType: noteSourceTypeEnum("source_type").notNull().default("ORIGINAL"),
    originalAuthor: varchar("original_author", {
      length: 255,
    }),
    sourceUrl: text("source_url"),

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
    viewCount: integer("view_count").notNull().default(0),
    rejectionReason: text("rejection_reason"),

    ...timestamps,
    publishedAt: timestamp("published_at"),
    tags: text("tags").array().default([]),

    searchVector: tsvector("search_vector"),
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

export const noteModerationActionEnum = pgEnum("note_moderation_action", [
  "PUBLISH",
  "REJECT",
  "REMOVE",
  "RESTORE",
  "UNPUBLISH",
])

export const noteModerationEvents = pgTable("note_moderation_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  noteId: uuid("note_id")
    .notNull()
    .references(() => notes.id, { onDelete: "cascade" }),
  action: noteModerationActionEnum("action").notNull(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => users.id),
  reason: text("reason"),
  ...timestamps,
})

export type NoteType = typeof notes.$inferSelect
export type NewNoteType = typeof notes.$inferInsert

export type NoteModerationEventType = typeof noteModerationEvents.$inferInsert

export type NoteModerationEvent = typeof noteModerationEvents.$inferSelect

export type NoteStatus = NoteType["status"]
export type ProcessingStatus = NoteType["processingStatus"]
export type NoteSourceType = NoteType["sourceType"]

export type NoteModerationAction = NoteModerationEventType["action"]
