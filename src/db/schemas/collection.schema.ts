import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "./user.schema"
import { timestamps } from "./schema.helper"
import { notes } from "./note.schema"

export const collections = pgTable(
  "collections",
  {
    id: uuid().defaultRandom().primaryKey(),

    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    parentId: uuid("parent_id"),

    name: text("name").notNull(),

    slug: text("slug").notNull(),

    description: text("description"),

    position: integer("position").notNull().default(0),

    ...timestamps,
  },
  (table) => [
    index("collections_owner_idx").on(table.ownerId),

    index("collections_parent_idx").on(table.parentId),

    uniqueIndex("collections_owner_slug_idx").on(table.ownerId, table.slug),
  ]
)

export const collectionNotes = pgTable(
  "collection_notes",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, {
        onDelete: "cascade",
      }),

    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.collectionId, table.noteId],
    }),

    index("collection_notes_collection_idx").on(table.collectionId),

    index("collection_notes_note_idx").on(table.noteId),
  ]
)

export const collectionSaves = pgTable(
  "collection_saves",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, {
        onDelete: "cascade",
      }),

    ...timestamps,
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.collectionId],
    }),

    index("collection_saves_user_idx").on(table.userId),

    index("collection_saves_collection_idx").on(table.collectionId),
  ]
)
