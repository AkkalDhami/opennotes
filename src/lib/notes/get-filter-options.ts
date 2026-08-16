import { eq, isNotNull, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { notes, users } from "@/db";
import type { NoteFilterOptions } from "@/components/notes/note-filters";

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  "plus-two": "+2",
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  other: "Other",
};

async function distinctColumn<T extends AnyPgColumn>(
  column: T,
): Promise<{ value: string; label: string }[]> {
  const rows = await db
    .selectDistinct({ value: column })
    .from(notes)
    .where(sql`${eq(notes.status, "PUBLISHED")} AND ${isNotNull(column)}`)
    .orderBy(column);

  return rows
    .filter((row) => Boolean(row.value))
    .map((row) => ({ value: String(row.value), label: String(row.value) }));
}

/**
 * Populates the filter dropdowns from real, currently-in-use values on
 * published notes, so the UI never offers a filter combination that
 * returns zero results. Cache this at the route/data layer (e.g. with
 * `unstable_cache` or a short revalidate window) once wired into a real
 * deployment — it's a cheap set of DISTINCT queries but doesn't need to
 * run on every request.
 */
export async function getNoteFilterOptions(): Promise<NoteFilterOptions> {
  const [
    educationLevels,
    grades,
    subjects,
    topics,
    institutions,
    academicYears,
    contributorRows,
    tagRows,
  ] = await Promise.all([
    distinctColumn(notes.educationLevel),
    distinctColumn(notes.grade),
    distinctColumn(notes.subject),
    distinctColumn(notes.topic),
    distinctColumn(notes.course),
    distinctColumn(notes.academicYear),
    db
      .selectDistinct({ username: users.username, name: users.name })
      .from(notes)
      .innerJoin(users, eq(notes.contributorId, users.id))
      .where(eq(notes.status, "PUBLISHED"))
      .orderBy(users.name),
    db
      .select({ tag: sql<string>`unnest(${notes.tags})` })
      .from(notes)
      .where(eq(notes.status, "PUBLISHED")),
  ]);

  const uniqueTags = Array.from(new Set(tagRows.map((row) => row.tag))).sort();

  return {
    educationLevels: educationLevels.map((option) => ({
      value: option.value,
      label: EDUCATION_LEVEL_LABELS[option.value] ?? option.label,
    })),
    grades,
    subjects,
    topics,
    institutions,
    academicYears,
    contributors: contributorRows.map((row) => ({
      value: row.username,
      label: row.name,
    })),
    tags: uniqueTags.map((tag) => ({ value: tag, label: `#${tag}` })),
  };
}
