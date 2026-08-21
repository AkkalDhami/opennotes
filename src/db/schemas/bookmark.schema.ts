import { index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"

import { notes } from "./note.schema"
import { users } from "./user.schema"
import { timestamps } from "./schema.helper"

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, {
        onDelete: "cascade",
      }),

    ...timestamps,
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.noteId],
    }),

    index("bookmarks_user_idx").on(table.userId),
    index("bookmarks_note_idx").on(table.noteId),
  ]
)

export type Bookmark = typeof bookmarks.$inferSelect
export type NewBookmark = typeof bookmarks.$inferInsert
