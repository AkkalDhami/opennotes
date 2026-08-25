-- ===========================================================================
-- OpenNotes — PostgreSQL full-text search infrastructure
-- ===========================================================================
--
-- WHY THIS FILE EXISTS
-- --------------------
-- `drizzle-kit push` can create the `notes.search_vector` column, but it
-- cannot express anything else this feature needs: an extension, a trigger,
-- a weighted tsvector, or GIN indexes. Without those, `search_vector` is a
-- permanently NULL column and `search_vector @@ query` never matches a
-- single row. That is exactly the state this file fixes.
--
-- Apply with:  npm run db:search           (idempotent, safe to re-run)
--              npm run db:search -- --rebuild   (also recomputes every row)
--
-- Run it after any `npm run db:push` that touched the `notes` table, since
-- push can drop and recreate objects it doesn't know about.
--
-- Every statement below is guarded (IF NOT EXISTS / OR REPLACE / DROP ...
-- IF EXISTS), so re-running is a no-op rather than an error.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
-- pg_trgm powers the fuzzy/typo-tolerant fallback (the `%` operator and
-- similarity()). Supported on Neon.
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ---------------------------------------------------------------------------
-- 2. The column
-- ---------------------------------------------------------------------------
-- Normally created by `db:push` from the `tsvector` custom type in
-- src/db/schemas/schema.helper.ts. Guarded here so this script also works on
-- a database that hasn't been pushed yet, and so it never silently depends
-- on push having run first.
ALTER TABLE notes ADD COLUMN IF NOT EXISTS search_vector tsvector;


-- ---------------------------------------------------------------------------
-- 3. The vector builder
-- ---------------------------------------------------------------------------
-- One function, used by BOTH the trigger and the backfill, so there is
-- exactly one definition of "what a note's search vector contains". If you
-- change the weights, change them here and re-run with --rebuild.
--
-- Weights mirror TSVECTOR_WEIGHTS in src/lib/search/search-constants.ts:
--   A  title, topic             — what the note is actually about
--   B  subject, tags, category  — how it's classified
--   C  description              — supporting prose
--   D  course                   — coarse context
--
-- `category` earns weight B rather than C because it is a controlled
-- vocabulary (NOTES_CATEGORIES: "previous-year-questions",
-- "handwritten-notes", "revision-notes") that people search by directly —
-- "physics previous year questions" is a real query shape here.
--
-- The 'simple' text search configuration is deliberate (not 'english').
-- This corpus is full of proper nouns and abbreviations — BCA, DBMS, SEE,
-- C++ — and English stemming mangles them. 'simple' lowercases and
-- de-duplicates without stemming.
--
-- Marked STABLE, not IMMUTABLE, because array_to_string() is only STABLE.
-- That is precisely why search_vector is trigger-maintained rather than a
-- GENERATED ALWAYS column: Postgres rejects non-immutable expressions in
-- generated columns, so the "generated column" approach cannot include the
-- tags array at all.
-- Drop every existing overload by name first. `CREATE OR REPLACE FUNCTION`
-- only replaces a function with the *same* argument list — change the
-- signature (as happened when `category` was added) and you get a second
-- overload instead, leaving `notes_build_search_vector(...)` ambiguous. This
-- keeps exactly one definition alive no matter what a previous run created.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'notes_build_search_vector'
      AND n.nspname = current_schema()
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE', fn.sig);
  END LOOP;
END
$$;

CREATE OR REPLACE FUNCTION notes_build_search_vector(
  p_title       text,
  p_topic       text,
  p_subject     text,
  p_tags        text[],
  p_category    text,
  p_description text,
  p_course      text
) RETURNS tsvector
LANGUAGE sql
STABLE
AS $$
  SELECT
       setweight(to_tsvector('simple', coalesce(p_title, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(p_topic, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(p_subject, '')), 'B')
    || setweight(
         to_tsvector('simple', coalesce(array_to_string(p_tags, ' '), '')),
         'B'
       )
    || setweight(to_tsvector('simple', coalesce(p_category, '')), 'B')
    || setweight(to_tsvector('simple', coalesce(p_description, '')), 'C')
    || setweight(to_tsvector('simple', coalesce(p_course, '')), 'D');
$$;

-- Note on slugs: subject/course/grade are stored slugified
-- ("computer-science", "grade-12"). Postgres's default parser indexes a
-- hyphenated word as the whole token AND its parts, so "computer-science"
-- is findable by "computer", "science", or "computer science". No manual
-- de-slugging needed.


-- ---------------------------------------------------------------------------
-- 4. Keeping it in sync
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION notes_search_vector_refresh() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := notes_build_search_vector(
    NEW.title,
    NEW.topic,
    NEW.subject,
    NEW.tags,
    NEW.category,
    NEW.description,
    NEW.course
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notes_search_vector_trg ON notes;

-- `UPDATE OF <cols>` matters for performance, not correctness: the download
-- and view counters are hot paths that UPDATE notes on every request, and
-- there is no reason to rebuild a tsvector when download_count changes.
-- This fires only when a column that actually feeds the vector is in the
-- SET list.
--
-- Keep this list in sync with the arguments passed above. A column that
-- feeds the vector but is missing here produces a silently stale vector —
-- the worst failure mode in this file, because search just quietly stops
-- finding recently edited notes.
CREATE TRIGGER notes_search_vector_trg
BEFORE INSERT OR UPDATE OF
  title, topic, subject, tags, category, description, course
ON notes
FOR EACH ROW
EXECUTE FUNCTION notes_search_vector_refresh();


-- ---------------------------------------------------------------------------
-- 5. Backfill
-- ---------------------------------------------------------------------------
-- The trigger only covers rows written from now on. Existing rows have a
-- NULL vector and would stay invisible to search forever.
--
-- Only touches NULL rows, so re-running is cheap. `npm run db:search --
-- --rebuild` appends a second statement that recomputes everything (use it
-- after changing weights above).
UPDATE notes
SET search_vector = notes_build_search_vector(
      title, topic, subject, tags, category, description, course
    )
WHERE search_vector IS NULL;


-- ---------------------------------------------------------------------------
-- 6. Indexes
-- ---------------------------------------------------------------------------
-- The full-text index. Without this, every query is a sequential scan that
-- recomputes ts_rank for the whole table.
CREATE INDEX IF NOT EXISTS notes_search_vector_idx
  ON notes USING GIN (search_vector);

-- Trigram indexes for the fuzzy fallback.
--
-- CRITICAL: the indexed expression must match the query expression
-- character for character, or the planner silently ignores the index. These
-- three mirror exactly what buildRankingExpressions() emits in
-- src/lib/search/search-ranking.ts. If you edit one, edit the other.
--
-- These also accelerate the prefix ILIKE used by the autocomplete
-- suggestions, which a btree index cannot do for a leading wildcard.
CREATE INDEX IF NOT EXISTS notes_title_trgm_idx
  ON notes USING GIN (lower(title) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS notes_topic_trgm_idx
  ON notes USING GIN (lower(coalesce(topic, '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS notes_subject_trgm_idx
  ON notes USING GIN (lower(subject) gin_trgm_ops);

-- The empty-query case: /notes with no `q` is a browse page ordered by
-- recency over published notes only. A partial index keeps drafts, rejected
-- and removed notes out of the index entirely.
CREATE INDEX IF NOT EXISTS notes_published_recent_idx
  ON notes (published_at DESC)
  WHERE status = 'PUBLISHED';

-- Same idea for the "most downloaded" and "most viewed" sorts.
CREATE INDEX IF NOT EXISTS notes_published_downloads_idx
  ON notes (download_count DESC)
  WHERE status = 'PUBLISHED';

CREATE INDEX IF NOT EXISTS notes_published_views_idx
  ON notes (view_count DESC)
  WHERE status = 'PUBLISHED';

-- Tag filtering uses the array overlap operator (&&), which needs GIN.
CREATE INDEX IF NOT EXISTS notes_tags_gin_idx
  ON notes USING GIN (tags);


-- ---------------------------------------------------------------------------
-- 7. Planner statistics
-- ---------------------------------------------------------------------------
-- The backfill above rewrote most of the table; without fresh stats the
-- planner may keep choosing sequential scans over the new indexes.
ANALYZE notes;
