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
 * Drizzle doesn't ship a built-in `tsvector` column type, so this defines
 * a minimal custom one. The column itself is a PostgreSQL GENERATED ALWAYS
 * AS ... STORED column (see db/migrations/0001_notes_search.sql) — Drizzle
 * never writes to it directly, it's only ever read from in SELECT/ORDER BY/
 * WHERE. Postgres recomputes it automatically whenever title, description,
 * subject, topic, or tags change, so there's no "stale search vector" risk
 * (§11) and no application-level sync code to maintain.
 */
export const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return "tsvector"
  },
})
