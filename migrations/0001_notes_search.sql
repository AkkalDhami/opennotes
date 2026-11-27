-- PostgreSQL full-text and fuzzy-search support for public notes.
-- The trigger-maintained vector is required because tags is a text[] and
-- array_to_string() is STABLE, which PostgreSQL rejects in generated columns.
-- Keep this file in sync with src/db/sql/notes-search.sql.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE notes ADD COLUMN IF NOT EXISTS search_vector tsvector;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'notes'
      AND column_name = 'search_vector'
      AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE notes DROP COLUMN search_vector;
    ALTER TABLE notes ADD COLUMN search_vector tsvector;
  END IF;
END
$$;

UPDATE notes SET tags = '{}'::text[] WHERE tags IS NULL;
ALTER TABLE notes ALTER COLUMN tags SET DEFAULT '{}'::text[];
ALTER TABLE notes ALTER COLUMN tags SET NOT NULL;

CREATE OR REPLACE FUNCTION notes_normalize_search_text(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT lower(regexp_replace(replace(value, '-', ' '), '\s+', ' ', 'g'))
$$;

CREATE OR REPLACE FUNCTION notes_search_text_query(value text)
RETURNS tsquery
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT CASE
    WHEN notes_normalize_search_text(coalesce(value, '')) = '' THEN NULL::tsquery
    ELSE websearch_to_tsquery(
      'simple',
      replace(notes_normalize_search_text(coalesce(value, '')), ' ', ' & ')
    )
  END
$$;

CREATE OR REPLACE FUNCTION notes_build_search_vector(
  p_title text,
  p_topic text,
  p_subject text,
  p_tags text[],
  p_category text,
  p_description text,
  p_course text,
  p_grade text,
  p_education text
) RETURNS tsvector
LANGUAGE sql
STABLE
AS $$
  SELECT
       setweight(to_tsvector('simple', notes_normalize_search_text(coalesce(p_title, ''))), 'A')
    || setweight(to_tsvector('simple', notes_normalize_search_text(coalesce(p_topic, ''))), 'A')
    || setweight(to_tsvector('simple', notes_normalize_search_text(coalesce(p_subject, ''))), 'B')
    || setweight(to_tsvector('simple', notes_normalize_search_text(coalesce(array_to_string(p_tags, ' '), ''))), 'B')
    || setweight(to_tsvector('simple', notes_normalize_search_text(coalesce(p_category, ''))), 'B')
    || setweight(to_tsvector('simple', notes_normalize_search_text(coalesce(p_description, ''))), 'C')
    || setweight(to_tsvector('simple', notes_normalize_search_text(coalesce(p_course, ''))), 'D')
    || setweight(to_tsvector('simple', notes_normalize_search_text(coalesce(p_grade, ''))), 'D')
    || setweight(to_tsvector('simple', notes_normalize_search_text(coalesce(p_education, ''))), 'D')
$$;

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
    NEW.course,
    NEW.grade,
    NEW.education_level
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notes_search_vector_trg ON notes;
CREATE TRIGGER notes_search_vector_trg
BEFORE INSERT OR UPDATE OF
  title, topic, subject, tags, category, description, course, grade, education_level
ON notes
FOR EACH ROW
EXECUTE FUNCTION notes_search_vector_refresh();

UPDATE notes
SET search_vector = notes_build_search_vector(
  title, topic, subject, tags, category, description, course, grade, education_level
);

CREATE INDEX IF NOT EXISTS notes_search_vector_idx
  ON notes USING gin (search_vector);

DROP INDEX IF EXISTS notes_title_trgm_idx;
CREATE INDEX notes_title_trgm_idx
  ON notes USING gin (notes_normalize_search_text(title) gin_trgm_ops);

DROP INDEX IF EXISTS notes_topic_trgm_idx;
CREATE INDEX notes_topic_trgm_idx
  ON notes USING gin (notes_normalize_search_text(coalesce(topic, '')) gin_trgm_ops);

DROP INDEX IF EXISTS notes_subject_trgm_idx;
CREATE INDEX notes_subject_trgm_idx
  ON notes USING gin (notes_normalize_search_text(subject) gin_trgm_ops);

DROP INDEX IF EXISTS notes_category_trgm_idx;
CREATE INDEX notes_category_trgm_idx
  ON notes USING gin (notes_normalize_search_text(category) gin_trgm_ops);

DROP INDEX IF EXISTS notes_course_trgm_idx;
CREATE INDEX notes_course_trgm_idx
  ON notes USING gin (notes_normalize_search_text(course) gin_trgm_ops);

DROP INDEX IF EXISTS users_name_trgm_idx;
CREATE INDEX users_name_trgm_idx
  ON users USING gin (notes_normalize_search_text(name) gin_trgm_ops);

DROP INDEX IF EXISTS users_username_trgm_idx;
CREATE INDEX users_username_trgm_idx
  ON users USING gin (notes_normalize_search_text(username) gin_trgm_ops);

ANALYZE notes;
