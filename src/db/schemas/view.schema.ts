import { index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core"

import { notes } from "./note.schema"
import { timestamps } from "./schema.helper"

export const views = pgTable(
  "views",
  {
    id: uuid().defaultRandom().primaryKey(),

    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, {
        onDelete: "cascade",
      }),

    viewerHash: text("viewer_hash").notNull(),

    ...timestamps,
  },
  (t) => [
    index("views_note_idx").on(t.noteId),

    uniqueIndex("views_note_viewer_idx").on(t.noteId, t.viewerHash),
  ]
)

export type ViewType = typeof views.$inferSelect
