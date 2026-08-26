import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm"

import { db } from "@/db"
import { bookmarks, notes, users } from "@/db"
import type { PublicNote } from "@/types/note"

export const SAVED_NOTES_PAGE_SIZE = 20

export type SavedNotesSort =
  | "recent" // recently saved (default)
  | "updated" // recently updated
  | "newest" // newest published
  | "oldest" // oldest published
  | "downloads" // most downloaded
  | "views" // most viewed

const SORT_OPTIONS: { value: SavedNotesSort; label: string }[] = [
  { value: "recent", label: "Recently saved" },
  { value: "updated", label: "Recently updated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "downloads", label: "Most downloaded" },
  { value: "views", label: "Most viewed" },
]

export function getSavedNotesSortOptions() {
  return SORT_OPTIONS
}

export function parseSavedNotesSort(value: string | undefined): SavedNotesSort {
  const match = SORT_OPTIONS.find((option) => option.value === value)
  return match?.value ?? "recent"
}

interface GetSavedNotesParams {
  userId: string
  query?: string
  sort?: SavedNotesSort
  page?: number
}

interface GetSavedNotesResult {
  notes: PublicNote[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Fetches the current user's saved (bookmarked) notes.
 *
 * Security: userId MUST come from the server-side session (see page.tsx).
 * Never accept a userId from the client / query params here.
 */
export async function getSavedNotes({
  userId,
  query,
  sort = "recent",
  page = 1,
}: GetSavedNotesParams): Promise<GetSavedNotesResult> {
  const pageSize = SAVED_NOTES_PAGE_SIZE
  const safePage = Math.max(1, page)
  const offset = (safePage - 1) * pageSize

  const trimmedQuery = query?.trim()
  const searchClause = trimmedQuery
    ? or(
        ilike(notes.title, `%${trimmedQuery}%`),
        ilike(notes.description, `%${trimmedQuery}%`),
        ilike(notes.subject, `%${trimmedQuery}%`),
        ilike(notes.course, `%${trimmedQuery}%`),
        ilike(notes.topic, `%${trimmedQuery}%`),
        ilike(users.name, `%${trimmedQuery}%`),
        // tags is a text[] column — match if any tag contains the query
        sql`${notes.tags}::text ILIKE ${`%${trimmedQuery}%`}`
      )
    : undefined

  const whereClause = and(
    eq(bookmarks.userId, userId),
    eq(notes.status, "PUBLISHED"),
    searchClause
  )

  const orderBy = (() => {
    switch (sort) {
      case "updated":
        return desc(notes.updatedAt)
      case "newest":
        return desc(notes.publishedAt)
      case "oldest":
        return asc(notes.publishedAt)
      case "downloads":
        return desc(notes.downloadCount)
      case "views":
        return desc(notes.viewCount)
      case "recent":
      default:
        return desc(bookmarks.createdAt)
    }
  })()

  const baseQuery = db
    .select({
      note: notes,
      contributor: users,
      savedAt: bookmarks.createdAt,
    })
    .from(bookmarks)
    .innerJoin(notes, eq(bookmarks.noteId, notes.id))
    .innerJoin(users, eq(notes.contributorId, users.id))
    .where(whereClause)

  const [rows, totalRow] = await Promise.all([
    baseQuery.orderBy(orderBy).limit(pageSize).offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookmarks)
      .innerJoin(notes, eq(bookmarks.noteId, notes.id))
      .innerJoin(users, eq(notes.contributorId, users.id))
      .where(whereClause),
  ])

  const total = totalRow[0]?.count ?? 0

  const publicNotes: PublicNote[] = rows.map(({ note, contributor }) => ({
    id: note.id,
    slug: note.slug,
    title: note.title,
    description: note.description,
    subject: note.subject,
    course: note.course,
    grade: note.grade,
    educationLevel: note.educationLevel,
    topic: note.topic,
    academicYear: note.academicYear,
    tags: note.tags ?? [],
    pageCount: note.pageCount,
    fileSizeBytes: note.fileSizeBytes,
    filePath: note.filePath,
    viewCount: note.viewCount,
    downloadCount: note.downloadCount,
    publishedAt: note.publishedAt ? new Date(note.publishedAt) : new Date(),
    lastModifiedAt: note.updatedAt ? new Date(note.updatedAt) : null,
    contributor: {
      id: contributor.id,
      name: contributor.name,
      avatarUrl: contributor.avatarUrl,
      username: contributor.username,
    },
    sourceType: note.sourceType,
    sourceUrl: note.sourceUrl,
    originalAuthor: note.originalAuthor,
    isBookmarked: true,
  }))

  return {
    notes: publicNotes,
    total,
    page: safePage,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}
