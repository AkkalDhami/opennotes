import { eq, isNotNull, sql } from "drizzle-orm"
import { AnyPgColumn } from "drizzle-orm/pg-core"
import { db } from "@/db"
import { notes, users } from "@/db"
import { NoteFilterOptions } from "@/components/notes/note-filters"
import { slugToTitle } from "@/utils/slug"

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  "plus-two": "+2",
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  other: "Other",
}

async function distinctColumn<T extends AnyPgColumn>(
  column: T
): Promise<{ value: string; label: string }[]> {
  const rows = await db
    .selectDistinct({ value: column })
    .from(notes)
    .where(sql`${eq(notes.status, "PUBLISHED")} AND ${isNotNull(column)}`)
    .orderBy(column)

  return rows
    .filter((row) => Boolean(row.value))
    .map((row) => ({ value: String(row.value), label: String(row.value) }))
}

export async function getNoteFilterOptions(): Promise<NoteFilterOptions> {
  const [
    educationLevels,
    grades,
    subjects,
    topics,
    courses,
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
  ])

  const uniqueTags = Array.from(new Set(tagRows.map((row) => row.tag))).sort()

  return {
    educationLevels: educationLevels.map((option) => ({
      id: option.value,
      name: slugToTitle(EDUCATION_LEVEL_LABELS[option.value] ?? option.label),
    })),
    grades: grades.map((option) => ({
      id: option.value,
      name: slugToTitle(option.label),
    })),
    subjects: subjects.map((option) => ({
      id: option.value,
      name: slugToTitle(option.label),
    })),
    topics: topics.map((option) => ({
      id: option.value,
      name: slugToTitle(option.label),
    })),
    courses: courses.map((option) => ({
      id: option.value,
      name: slugToTitle(option.label),
    })),
    academicYears: academicYears.map((option) => ({
      id: option.value,
      name: option.label,
    })),
    contributors: contributorRows.map((row) => ({
      id: row.username,
      name: row.name,
    })),
    tags: uniqueTags.map((tag) => ({ id: tag, name: `#${tag}` })),
  }
}
