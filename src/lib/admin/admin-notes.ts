import "server-only"
import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm"
import { db, noteModerationEvents } from "@/db"
import { notes, users } from "@/db/"
import type {
  AdminModerationEvent,
  AdminNoteDetail,
  AdminNoteListItem,
  AdminNoteStats,
  AdminNotesFilters,
  PaginatedResult,
} from "@/types/note"
import { getFileUrl } from "@/utils/get-file-url"

/**
 * Builds the shared WHERE clause for search + filters so the list query and
 * the count query stay in sync.
 */
function buildWhereClause(filters: AdminNotesFilters): SQL | undefined {
  const conditions: SQL[] = []

  if (filters.q) {
    const term = `%${filters.q}%`
    const searchClause = or(
      ilike(notes.title, term),
      ilike(notes.description, term),
      ilike(users.name, term),
      ilike(users.username, term),
      ilike(notes.subject, term),
      ilike(notes.topic, term)
    )
    if (searchClause) conditions.push(searchClause)
  }

  if (filters.status) conditions.push(eq(notes.status, filters.status))
  if (filters.subject) conditions.push(eq(notes.subject, filters.subject))
  if (filters.educationLevel)
    conditions.push(eq(notes.educationLevel, filters.educationLevel))
  if (filters.sourceType)
    conditions.push(eq(notes.sourceType, filters.sourceType))
  if (filters.processingStatus)
    conditions.push(eq(notes.processingStatus, filters.processingStatus))

  return conditions.length > 0 ? and(...conditions) : undefined
}

function resolveSort(sort: AdminNotesFilters["sort"]) {
  switch (sort) {
    case "oldest":
      return asc(notes.createdAt)
    case "most_downloaded":
      return desc(notes.downloadCount)
    // case "most_viewed":
    //   return desc(notes.viewCount)
    case "recently_updated":
      return desc(notes.updatedAt)
    case "title_asc":
      return asc(notes.title)
    case "title_desc":
      return desc(notes.title)
    case "newest":
    default:
      return desc(notes.createdAt)
  }
}

function toListItem(row: {
  note: typeof notes.$inferSelect
  contributor: typeof users.$inferSelect
}): AdminNoteListItem {
  const { note, contributor } = row
  return {
    id: note.id,
    slug: note.slug,
    title: note.title,
    educationLevel: note.educationLevel,
    grade: note.grade,
    course: note.course,
    topic: note.topic,
    tags: note.tags || [],
    subject: note.subject,
    contributor: {
      id: contributor.id,
      name: contributor.name,
      username: contributor.username,
      avatarUrl: contributor.avatarUrl,
      isVerified: true,
    },
    sourceType: note.sourceType,
    sourceAuthor: note.originalAuthor,
    sourceUrl: note.sourceUrl,
    status: note.status,
    processingStatus: note.processingStatus,
    downloadCount: note.downloadCount,
    // viewCount: note.viewCount,
    publishedAt: note.publishedAt?.toISOString() ?? null,
    updatedAt: note.updatedAt.toISOString(),
    createdAt: note.createdAt.toISOString(),
  }
}

/**
 * Fetches one page of notes for the admin table, joined against the
 * contributor in a single query (no N+1), filtered and sorted in Postgres.
 */
export async function getAdminNotes(
  filters: AdminNotesFilters
): Promise<PaginatedResult<AdminNoteListItem>> {
  const where = buildWhereClause(filters)
  const offset = (filters.page - 1) * filters.pageSize

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({ note: notes, contributor: users })
      .from(notes)
      .innerJoin(users, eq(notes.contributorId, users.id))
      .where(where)
      .orderBy(resolveSort(filters.sort))
      .limit(filters.pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notes)
      .innerJoin(users, eq(notes.contributorId, users.id))
      .where(where),
  ])

  const total = count ?? 0

  return {
    items: rows.map(toListItem),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    },
  }
}

/** Top statistics row: total, published, pending, removed. */
export async function getAdminNoteStats(): Promise<AdminNoteStats> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [row] = await db
    .select({
      totalNotes: sql<number>`count(*)::int`,
      totalNotesDeltaThisMonth: sql<number>`
        count(*) filter (where ${notes.createdAt} >= ${startOfMonth.toISOString()})::int
      `,
      published: sql<number>`count(*) filter (where ${notes.status} = 'PUBLISHED')::int`,
      pendingReview: sql<number>`count(*) filter (where ${notes.status} = 'PENDING_REVIEW')::int`,
      removed: sql<number>`count(*) filter (where ${notes.status} = 'REMOVED')::int`,
    })
    .from(notes)

  return (
    row ?? {
      totalNotes: 0,
      totalNotesDeltaThisMonth: 0,
      published: 0,
      pendingReview: 0,
      removed: 0,
    }
  )
}

/** Full detail for the review dialog / note detail view, including moderation history. */
export async function getAdminNoteById(
  noteId: string
): Promise<AdminNoteDetail | null> {
  const [row] = await db
    .select({ note: notes, contributor: users })
    .from(notes)
    .innerJoin(users, eq(notes.contributorId, users.id))
    .where(eq(notes.id, noteId))
    .limit(1)

  if (!row) return null

  const historyRows = await db
    .select({ event: noteModerationEvents, admin: users })
    .from(noteModerationEvents)
    .innerJoin(users, eq(noteModerationEvents.adminId, users.id))
    .where(eq(noteModerationEvents.noteId, noteId))
    .orderBy(desc(noteModerationEvents.createdAt))

  const moderationHistory: AdminModerationEvent[] = historyRows.map((h) => ({
    id: h.event.id,
    action: h.event.action as AdminModerationEvent["action"],
    adminUsername: h.admin.username,
    reason: h.event.reason,
    createdAt: h.event.createdAt.toISOString(),
  }))

  return {
    ...toListItem(row),
    description: row.note.description,
    grade: row.note.grade,
    fileUrl: getFileUrl(row.note.filePath),
    fileSizeBytes: row.note.fileSizeBytes,
    pageCount: row.note.pageCount,
    fileHash: row.note.fileHash,
    moderationHistory: moderationHistory,
  }
}
