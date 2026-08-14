import { index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core"
import { notes } from "./note.schema"
import { timestamps } from "./schema.helper"

export const downloads = pgTable(
  "downloads",
  {
    id: uuid().defaultRandom().primaryKey(),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    downloaderHash: text("downloader_hash").notNull(),
    ...timestamps,
  },
  (t) => [
    index("downloads_note_idx").on(t.noteId),

    uniqueIndex("downloads_note_downloader_idx").on(t.noteId, t.downloaderHash),
  ]
)

export type DownloadType = typeof downloads.$inferSelect
