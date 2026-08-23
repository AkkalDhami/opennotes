import { relations } from "drizzle-orm/_relations"
import { users } from "./schemas/user.schema"
import { noteModerationEvents, notes } from "./schemas/note.schema"
import { bookmarks } from "./schemas/bookmark.schema"
import { downloads } from "./schemas/download.schema"
import { reports } from "./schemas/report.schema"
import {
  contributorScoreEvents,
  contributorStats,
} from "./schemas/contributor.schema"
import { badges, userBadges } from "./schemas/badge.schema"
import { collectionNotes, collections } from "./schemas/collection.schema"
import { contributorProfiles } from "./schemas/contributor-profile.schema"
import { views } from "./schemas/view.schema"

export const usersRelations = relations(users, ({ one, many }) => ({
  notes: many(notes),

  bookmarks: many(bookmarks),

  reports: many(reports),

  contributorStats: one(contributorStats, {
    fields: [users.id],
    references: [contributorStats.userId],
  }),

  contributorProfile: one(contributorProfiles, {
    fields: [users.id],
    references: [contributorProfiles.userId],
  }),

  scoreEvents: many(contributorScoreEvents),

  badges: many(userBadges),

  collections: many(collections),

  noteModerationEvents: many(noteModerationEvents),
}))

export const notesRelations = relations(notes, ({ one, many }) => ({
  contributor: one(users, {
    fields: [notes.contributorId],
    references: [users.id],
  }),

  downloads: many(downloads),

  views: many(views),

  bookmarks: many(bookmarks),

  reports: many(reports),

  scoreEvents: many(contributorScoreEvents),

  collections: many(collectionNotes),

  noteModerationEvents: many(noteModerationEvents),
}))

export const downloadsRelations = relations(downloads, ({ one }) => ({
  note: one(notes, {
    fields: [downloads.noteId],
    references: [notes.id],
  }),
}))

export const viewsRelations = relations(views, ({ one }) => ({
  note: one(notes, {
    fields: [views.noteId],
    references: [notes.id],
  }),
}))

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),

  note: one(notes, {
    fields: [bookmarks.noteId],
    references: [notes.id],
  }),
}))

export const reportsRelations = relations(reports, ({ one }) => ({
  note: one(notes, {
    fields: [reports.noteId],
    references: [notes.id],
  }),

  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
}))

export const contributorStatsRelations = relations(
  contributorStats,
  ({ one }) => ({
    user: one(users, {
      fields: [contributorStats.userId],
      references: [users.id],
    }),
  })
)

export const contributorScoreEventsRelations = relations(
  contributorScoreEvents,
  ({ one }) => ({
    user: one(users, {
      fields: [contributorScoreEvents.userId],
      references: [users.id],
    }),

    note: one(notes, {
      fields: [contributorScoreEvents.noteId],
      references: [notes.id],
    }),
  })
)

export const badgesRelations = relations(badges, ({ many }) => ({
  users: many(userBadges),
}))

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),

  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}))

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  owner: one(users, {
    fields: [collections.ownerId],
    references: [users.id],
  }),

  parent: one(collections, {
    fields: [collections.parentId],
    references: [collections.id],
    relationName: "collectionHierarchy",
  }),

  children: many(collections, {
    relationName: "collectionHierarchy",
  }),

  notes: many(collectionNotes),
}))

export const collectionNotesRelations = relations(
  collectionNotes,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionNotes.collectionId],
      references: [collections.id],
    }),

    note: one(notes, {
      fields: [collectionNotes.noteId],
      references: [notes.id],
    }),
  })
)

export const contributorProfilesRelations = relations(
  contributorProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [contributorProfiles.userId],
      references: [users.id],
    }),
  })
)

export const noteModerationEventsRelations = relations(
  noteModerationEvents,
  ({ one }) => ({
    note: one(notes, {
      fields: [noteModerationEvents.noteId],
      references: [notes.id],
    }),

    admin: one(users, {
      fields: [noteModerationEvents.adminId],
      references: [users.id],
    }),
  })
)
