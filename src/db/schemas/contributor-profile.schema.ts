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

export const contributorTypeEnum = pgEnum("contributor_type", [
  "STUDENT",
  "TEACHER",
])

export const institutionTypeEnum = pgEnum("institution_type", [
  "SCHOOL",
  "COLLEGE",
  "UNIVERSITY",
  "OTHER",
])

export type ContributorSocialLink = {
  platform:
    | "WEBSITE"
    | "GITHUB"
    | "LINKEDIN"
    | "X"
    | "FACEBOOK"
    | "INSTAGRAM"
    | "YOUTUBE"
    | "TELEGRAM"
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

export const contributorProfileData = [
  {
    userId: "c11852a6-a381-48f7-ba57-7ad53b0aac18",
    type: "STUDENT",
    bio: "BSc CSIT student sharing programming notes, lecture materials, and exam preparation resources.",
    institutionName: "Tribhuvan University",
    institutionType: "UNIVERSITY",
    department: "Department of Computer Science and Information Technology",
    program: "BSc CSIT",
    designation: null,
    socialLinks: [
      {
        platform: "github",
        url: "https://github.com/example-student",
      },
    ],
    isVerified: false,
    createdAt: new Date("2026-01-12T08:30:00Z"),
    updatedAt: new Date("2026-07-18T14:20:00Z"),
  },

  {
    userId: "8c9f2a10-7d43-4e6b-91f8-2a6d3b4c5e11",
    type: "TEACHER",
    bio: "Computer science educator sharing clear, practical study materials for university students.",
    institutionName: "Kathmandu Model College",
    institutionType: "COLLEGE",
    department: "Computer Science",
    program: "Computer Science",
    designation: "Lecturer",
    socialLinks: [
      {
        platform: "linkedin",
        url: "https://linkedin.com/in/example-teacher",
      },
    ],
    isVerified: true,
    createdAt: new Date("2025-11-05T10:15:00Z"),
    updatedAt: new Date("2026-08-01T09:45:00Z"),
  },

  {
    userId: "4f72c8d1-91ab-4e3a-b62f-77d2e5c9a812",
    type: "STUDENT",
    bio: "Sharing mathematics and statistics notes collected throughout my undergraduate studies.",
    institutionName: "Pokhara University",
    institutionType: "UNIVERSITY",
    department: "School of Science and Technology",
    program: "BSc Computer Science",
    designation: null,
    socialLinks: [],
    isVerified: false,
    createdAt: new Date("2026-02-20T12:00:00Z"),
    updatedAt: new Date("2026-06-14T16:30:00Z"),
  },

  {
    userId: "72a5e9f3-2c81-4b67-9d20-1f84c6a73529",
    type: "TEACHER",
    bio: "Physics teacher sharing concise notes, formulas, and revision materials for secondary-level students.",
    institutionName: "Everest Secondary School",
    institutionType: "SCHOOL",
    department: "Science",
    program: null,
    designation: "Science Teacher",
    socialLinks: [],
    isVerified: true,
    createdAt: new Date("2025-09-18T07:45:00Z"),
    updatedAt: new Date("2026-07-29T11:10:00Z"),
  },

  {
    userId: "b83d1f64-5a27-4c90-8e31-6d92f7a41056",
    type: "STUDENT",
    bio: "Sharing database, networking, and software engineering notes with fellow students.",
    institutionName: "Patan Multiple Campus",
    institutionType: "COLLEGE",
    department: "Information Technology",
    program: "BCA",
    designation: null,
    socialLinks: [
      {
        platform: "github",
        url: "https://github.com/example-developer",
      },
      {
        platform: "website",
        url: "https://example.com",
      },
    ],
    isVerified: false,
    createdAt: new Date("2026-03-08T09:20:00Z"),
    updatedAt: new Date("2026-08-05T13:40:00Z"),
  },

  {
    userId: "91e4c7a2-36f8-4b15-a069-5d83c2e74190",
    type: "OTHER",
    bio: "Sharing open educational resources and study materials for students and independent learners.",
    institutionName: null,
    institutionType: null,
    department: null,
    program: null,
    designation: "Independent Contributor",
    socialLinks: [],
    isVerified: true,
    createdAt: new Date("2025-12-11T15:00:00Z"),
    updatedAt: new Date("2026-07-22T10:25:00Z"),
  },
]
