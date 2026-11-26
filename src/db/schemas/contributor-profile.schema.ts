import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "./user.schema"
import { timestamps } from "./schema.helper"
import { SocialPlatform } from "@/validations/contributor"

export const CONTRIBUTOR_TYPES = [
  "STUDENT",
  "TEACHER",
  "PROFESSIONAL",
  "ORGANIZATION",
  "INDEPENDENT",
] as const

export const contributorTypeEnum = pgEnum("contributor_type", CONTRIBUTOR_TYPES)

export const institutionTypeEnum = pgEnum("institution_type", [
  "SCHOOL",
  "COLLEGE",
  "UNIVERSITY",
  "OTHER",
])

export type ContributorSocialLink = {
  platform: SocialPlatform
  url: string
}

export const contributorProfiles = pgTable(
  "contributor_profiles",
  {
    id: uuid().defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    type: contributorTypeEnum("type").notNull(),

    bio: text("bio"),

    institutionName: text("institution_name"),

    institutionType: institutionTypeEnum("institution_type"),
    socialLinks: jsonb("social_links")
      .$type<ContributorSocialLink[]>()
      .notNull()
      .default([]),
    department: text("department"),

    program: text("program"),

    designation: text("designation"),

    isVerified: boolean("is_verified").notNull().default(false),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("contributor_profiles_user_idx").on(table.userId),

    index("contributor_profiles_type_idx").on(table.type),

    index("contributor_profiles_institution_idx").on(table.institutionName),
  ]
)

export type ContributorProfile = typeof contributorProfiles.$inferSelect

export type NewContributorProfile = typeof contributorProfiles.$inferInsert
