import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"
import { notes } from "./note.schema"
import { users } from "./user.schema"
import { timestamps } from "./schema.helper"

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.userId, t.noteId] })]
)

export type BookmarkType = typeof bookmarks.$inferSelect
