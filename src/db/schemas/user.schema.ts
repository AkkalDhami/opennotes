import {
  pgTable,
  pgEnum,
  varchar,
  uniqueIndex,
  uuid,
  boolean,
  text,
} from "drizzle-orm/pg-core"
import { timestamps } from "./schema.helper"

export const userRoleEnum = pgEnum("user_role", ["USER", "MODERATOR", "ADMIN"])

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: boolean("email_verified"),
    name: varchar("name").notNull(),
    role: userRoleEnum("role").notNull().default("USER"),
    username: varchar("username").notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    avatarId: text("avatar_id"),

    ...timestamps,
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    uniqueIndex("users_username_idx").on(t.username),
  ]
)

export type UserType = typeof users.$inferSelect
