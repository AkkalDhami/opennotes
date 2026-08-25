import { timestamp, customType } from "drizzle-orm/pg-core"

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}

/**
 * Drizzle doesn't ship a built-in `tsvector` column type, so this defines a
 * minimal custom one. Drizzle never writes to this column — it is only ever
 * read in WHERE / ORDER BY.
 *
 * IMPORTANT: `drizzle-kit push` creates this as a plain, empty `tsvector`
 * column. It is populated by a database trigger installed out-of-band by
 * `npm run db:search` (see src/db/sql/notes-search.sql). Until you run that,
 * `search_vector` is NULL on every row and full-text search silently matches
 * nothing — no error, just zero results.
 *
 * It is a trigger rather than a GENERATED ALWAYS column on purpose: the
 * vector includes `tags text[]`, and `array_to_string()` is only STABLE, not
 * IMMUTABLE, so Postgres rejects it in a generated-column expression.
 *
 * Re-run `npm run db:search` after any push that touched `notes`.
 */
export const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return "tsvector"
  },
})
