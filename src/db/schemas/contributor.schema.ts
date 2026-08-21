import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  timestamp,
  uniqueIndex,
  uuid,
  index,
} from "drizzle-orm/pg-core"

import { users } from "./user.schema"
import { notes } from "./note.schema"
import { timestamps } from "./schema.helper"

export const scoreEventTypeEnum = pgEnum("score_event_type", [
  "NOTE_PUBLISHED",
  "NOTE_DOWNLOADED",
  "NOTE_VIEWED",
  "NOTE_REPORTED",
  "NOTE_REMOVED",
  "MANUAL_ADJUSTMENT",
])

export const contributorStats = pgTable(
  "contributor_stats",
  {
    id: uuid().defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    noteCount: integer("note_count").notNull().default(0),

    downloadCount: integer("download_count").notNull().default(0),

    viewCount: integer("view_count").notNull().default(0),

    uniqueSubjectCount: integer("unique_subject_count").notNull().default(0),

    totalScore: real("total_score").notNull().default(0),

    qualityScore: real("quality_score").notNull().default(0),

    impactScore: real("impact_score").notNull().default(0),

    consistencyScore: real("consistency_score").notNull().default(0),

    lastContributionAt: timestamp("last_contribution_at"),

    calculatedAt: timestamp("calculated_at").notNull().defaultNow(),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("contributor_stats_user_id_idx").on(table.userId),

    index("contributor_stats_score_idx").on(table.totalScore),

    index("contributor_stats_download_idx").on(table.downloadCount),

    index("contributor_stats_note_count_idx").on(table.noteCount),
  ]
)

export const contributorScoreEvents = pgTable(
  "contributor_score_events",
  {
    id: uuid().defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    noteId: uuid("note_id").references(() => notes.id, {
      onDelete: "set null",
    }),

    type: scoreEventTypeEnum("type").notNull(),

    points: real("points").notNull(),

    metadata: jsonb("metadata"),

    ...timestamps,
  },
  (table) => [
    index("contributor_score_events_user_id_idx").on(table.userId),

    index("contributor_score_events_note_id_idx").on(table.noteId),

    index("contributor_score_events_type_idx").on(table.type),

    index("contributor_score_events_created_at_idx").on(table.createdAt),
  ]
)

export type ContributorStatsType = typeof contributorStats.$inferSelect

export type ContributorScoreEventType =
  typeof contributorScoreEvents.$inferSelect

export type ContributorStatsWithUser = ContributorStatsType & {
  user: typeof users.$inferSelect
}
