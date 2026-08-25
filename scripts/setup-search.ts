/**
 * Applies src/db/sql/notes-search.sql — the PostgreSQL full-text search
 * infrastructure that `drizzle-kit push` cannot express (extension, trigger,
 * weighted tsvector, GIN indexes).
 *
 *   npm run db:search              apply / repair (idempotent)
 *   npm run db:search -- --rebuild also recompute every row's vector
 *
 * Run this after any `db:push` that touched the `notes` table.
 *
 * Deliberately a standalone script rather than a drizzle migration: this
 * project's workflow is `db:push`, and there is no migrations folder to slot
 * into. The SQL is written to be safely re-runnable so "did someone already
 * apply this?" is never a question you have to answer.
 */

import { readFile } from "node:fs/promises"
import path from "node:path"

import { loadEnvConfig } from "@next/env"
import { Pool } from "@neondatabase/serverless"

const SQL_FILE = path.join(
  process.cwd(),
  "src",
  "db",
  "sql",
  "notes-search.sql"
)

/**
 * Recomputes every row rather than only the NULL ones. Needed after changing
 * the weights or the field list in notes_build_search_vector().
 */
const REBUILD_SQL = `
UPDATE notes
SET search_vector = notes_build_search_vector(
      title, topic, subject, tags, category, description, course
    );
`

/** Reports what actually exists afterwards, so a silent no-op is visible. */
const VERIFY_SQL = `
SELECT
  (SELECT count(*) FROM pg_extension WHERE extname = 'pg_trgm')          AS has_pg_trgm,
  (SELECT count(*) FROM pg_trigger
     WHERE tgname = 'notes_search_vector_trg' AND NOT tgisinternal)      AS has_trigger,
  (SELECT count(*) FROM pg_indexes
     WHERE tablename = 'notes' AND indexname = 'notes_search_vector_idx') AS has_gin_index,
  (SELECT count(*) FROM notes)                                           AS total_notes,
  (SELECT count(*) FROM notes WHERE search_vector IS NULL)               AS unindexed_notes;
`

type VerifyRow = {
  has_pg_trgm: number
  has_trigger: number
  has_gin_index: number
  total_notes: number
  unindexed_notes: number
}

async function main() {
  const rebuild = process.argv.includes("--rebuild")

  // Next.js env files aren't loaded automatically outside `next dev`/`next
  // build`, so pull in .env / .env.local the same way Next itself does.
  loadEnvConfig(process.cwd())

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error(
      "[db:search] DATABASE_URL is not set. Add it to .env.local and retry."
    )
    process.exit(1)
  }

  const sqlText = await readFile(SQL_FILE, "utf8")

  const pool = new Pool({ connectionString })

  try {
    console.log("[db:search] applying src/db/sql/notes-search.sql …")

    // No bound parameters, so the whole file can go over the simple query
    // protocol as one multi-statement batch. CREATE INDEX here is not
    // CONCURRENTLY, so running inside an implicit transaction is fine.
    await pool.query(sqlText)

    if (rebuild) {
      console.log("[db:search] --rebuild: recomputing every search vector …")
      await pool.query(REBUILD_SQL)
      await pool.query("ANALYZE notes;")
    }

    const { rows } = await pool.query<VerifyRow>(VERIFY_SQL)
    const result = rows[0]

    const ok = (n: number) => (Number(n) > 0 ? "yes" : "NO")

    console.log("")
    console.log("[db:search] verification")
    console.log(`  pg_trgm extension   : ${ok(result.has_pg_trgm)}`)
    console.log(`  sync trigger        : ${ok(result.has_trigger)}`)
    console.log(`  GIN index on vector : ${ok(result.has_gin_index)}`)
    console.log(`  notes total         : ${result.total_notes}`)
    console.log(`  notes unindexed     : ${result.unindexed_notes}`)
    console.log("")

    if (Number(result.unindexed_notes) > 0) {
      console.warn(
        `[db:search] ${result.unindexed_notes} note(s) still have a NULL search_vector. ` +
          "Re-run with --rebuild."
      )
      process.exitCode = 1
      return
    }

    console.log("[db:search] done — full-text search is live.")
  } catch (error) {
    console.error("[db:search] failed:", error)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

void main()
