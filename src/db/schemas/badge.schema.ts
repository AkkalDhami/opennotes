import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  index,
} from "drizzle-orm/pg-core"

import { users } from "./user.schema"
import { timestamps } from "./schema.helper"

export const badges = pgTable(
  "badges",
  {
    id: uuid().defaultRandom().primaryKey(),

    slug: text("slug").notNull(),

    name: text("name").notNull(),

    description: text("description"),

    tier: integer("tier").notNull().default(1),

    ...timestamps,
  },
  (table) => [uniqueIndex("badges_slug_idx").on(table.slug)]
)

export const userBadges = pgTable(
  "user_badges",
  {
    id: uuid().defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    badgeId: uuid("badge_id")
      .notNull()
      .references(() => badges.id, {
        onDelete: "cascade",
      }),

    awardedAt: timestamp("awarded_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_badges_user_badge_idx").on(table.userId, table.badgeId),

    index("user_badges_user_id_idx").on(table.userId),

    index("user_badges_badge_id_idx").on(table.badgeId),
  ]
)
