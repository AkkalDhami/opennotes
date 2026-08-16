import { relations } from "drizzle-orm/_relations"
import { users } from "./schemas/user.schema"
import { notes } from "./schemas/note.schema"
import { bookmarks } from "./schemas/bookmark.schema"
import { downloads } from "./schemas/download.schema"
import { reports } from "./schemas/report.schema"

export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
  bookmarks: many(bookmarks),
}))

export const notesRelations = relations(notes, ({ one, many }) => ({
  contributor: one(users, {
    fields: [notes.contributorId],
    references: [users.id],
  }),

  downloads: many(downloads),
  bookmarks: many(bookmarks),
  reports: many(reports),
}))

// Many-to-many between notes and tags is modelled through the noteTags junction table.
// Both sides need an explicit relation to it — that's what lets the query builder resolve
// `db.query.notes.findMany({ with: { noteTags: { with: { tag: true } } } })`.

export const downloadsRelations = relations(downloads, ({ one }) => ({
  note: one(notes, { fields: [downloads.noteId], references: [notes.id] }),
}))

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  note: one(notes, { fields: [bookmarks.noteId], references: [notes.id] }),
}))

export const reportsRelations = relations(reports, ({ one }) => ({
  note: one(notes, { fields: [reports.noteId], references: [notes.id] }),
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
}))
