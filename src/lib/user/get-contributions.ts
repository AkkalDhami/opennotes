import "server-only"
import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm"

import { db, NoteStatus } from "@/db"
import { notes } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import {
  ContributionFilters,
  ContributionListResult,
  ContributionStats,
} from "@/types/contribution"

const PAGE_SIZE = 20

/**
 * Columns exposed to the UI. Deliberately excludes fileKey, fileHash,
 * contributorId, and any other internal/storage identifiers.
 */
const contributionColumns = {
  id: notes.id,
  slug: notes.slug,
  title: notes.title,
  description: notes.description,
  subject: notes.subject,
  category: notes.category,
  educationLevel: notes.educationLevel,
  course: notes.course,
  grade: notes.grade,
  topic: notes.topic,
  academicYear: notes.academicYear,
  status: notes.status,
  tags: notes.tags,
  downloadCount: notes.downloadCount,
  viewCount: notes.viewCount,
  createdAt: notes.createdAt,
  publishedAt: notes.publishedAt,
  rejectionReason: notes.rejectionReason,
} as const

function buildFilterConditions(userId: string, filters: ContributionFilters) {
  const conditions = [eq(notes.contributorId, userId)]

  if (filters.status && filters.status !== "ALL") {
    conditions.push(eq(notes.status, filters.status))
  }

  if (filters.subject) {
    conditions.push(eq(notes.subject, filters.subject))
  }

  if (filters.level) {
    conditions.push(eq(notes.educationLevel, filters.level))
  }

  if (filters.course) {
    conditions.push(eq(notes.course, filters.course))
  }

  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`
    conditions.push(
      or(
        ilike(notes.title, term),
        ilike(notes.subject, term),
        ilike(notes.category, term),
        ilike(notes.course, term),
        ilike(notes.topic, term)
      )!
    )
  }

  return and(...conditions)
}

function resolveSort(sort: ContributionFilters["sort"]) {
  switch (sort) {
    case "oldest":
      return asc(notes.createdAt)
    case "most_downloaded":
      return desc(notes.downloadCount)
    case "newest":
    default:
      return desc(notes.createdAt)
  }
}

/**
 * Returns a paginated, filtered list of the authenticated user's own
 * contributions. The user id always comes from the session — never
 * from client input.
 */
export async function getUserContributions(
  filters: ContributionFilters = {}
): Promise<ContributionListResult> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {
      items: [],
      page: 1,
      pageSize: PAGE_SIZE,
      totalCount: 0,
      totalPages: 0,
    }
  }

  const page = Math.max(1, filters.page ?? 1)
  const whereClause = buildFilterConditions(currentUser.id, filters)
  const orderBy = resolveSort(filters.sort)

  const [items, [{ totalCount }]] = await Promise.all([
    db
      .select(contributionColumns)
      .from(notes)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ totalCount: count() }).from(notes).where(whereClause),
  ])

  return {
    items,
    page,
    pageSize: PAGE_SIZE,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
  }
}

/**
 * Returns aggregate stats (counts by status, total views/downloads)
 * for the authenticated user's contributions.
 */
export async function getUserContributionStats(): Promise<ContributionStats> {
  const currentUser = await getCurrentUser()

  const empty: ContributionStats = {
    total: 0,
    published: 0,
    pendingReview: 0,
    rejected: 0,
    draft: 0,
    removed: 0,
    totalDownloads: 0,
  }

  if (!currentUser) {
    return empty
  }

  const statusCountExpr = (status: NoteStatus) =>
    count(sql`CASE WHEN ${notes.status} = ${status} THEN 1 END`)

  const [row] = await db
    .select({
      total: count(),
      published: statusCountExpr("PUBLISHED"),
      pendingReview: statusCountExpr("PENDING_REVIEW"),
      rejected: statusCountExpr("REJECTED"),
      draft: statusCountExpr("DRAFT"),
      removed: statusCountExpr("REMOVED"),
      totalDownloads: sql<number>`COALESCE(SUM(${notes.downloadCount}), 0)`,
    })
    .from(notes)
    .where(eq(notes.contributorId, currentUser.id))

  return row ?? empty
}

export interface ContributionFilterOptions {
  subjectOptions: { label: string; value: string }[]
  levelOptions: { label: string; value: string }[]
  courseOptions: { label: string; value: string; levelId?: string }[]
}

/**
 * Derives the Subject / Educational Level / Course filter options from
 * the values actually present in the user's own contributions, so the
 * filter toolbar never offers options that would return zero results.
 *
 * If your app already has canonical lists (e.g. EDUCATIONAL_LEVELS,
 * PROGRAMS constants), prefer those instead and drop this function.
 */
export async function getUserContributionFilterOptions(): Promise<ContributionFilterOptions> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { subjectOptions: [], levelOptions: [], courseOptions: [] }
  }

  const rows = await db
    .selectDistinct({
      subject: notes.subject,
      educationLevel: notes.educationLevel,
      course: notes.course,
    })
    .from(notes)
    .where(eq(notes.contributorId, currentUser.id))

  const subjects = new Set<string>()
  const levels = new Set<string>()
  const courses = new Map<string, string>() // course -> educationLevel

  for (const row of rows) {
    if (row.subject) subjects.add(row.subject)
    if (row.educationLevel) levels.add(row.educationLevel)
    if (row.course) courses.set(row.course, row.educationLevel)
  }

  return {
    subjectOptions: Array.from(subjects).map((value) => ({
      label: value,
      value,
    })),
    levelOptions: Array.from(levels).map((value) => ({ label: value, value })),
    courseOptions: Array.from(courses.entries()).map(([value, levelId]) => ({
      label: value,
      value,
      levelId,
    })),
  }
}
