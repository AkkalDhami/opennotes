-- PostgreSQL full-text and fuzzy-search support for public notes.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(topic, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(subject, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(tags, ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS notes_search_vector_idx
  ON notes USING gin (search_vector);

CREATE INDEX IF NOT EXISTS notes_title_trgm_idx
  ON notes USING gin (lower(title) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS notes_topic_trgm_idx
  ON notes USING gin (lower(topic) gin_trgm_ops);
