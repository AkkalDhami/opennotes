import "server-only"
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm"

import { db, notes, users } from "@/db"
import { PublicNote } from "@/types/note"

export const CONTRIBUTORS_PER_PAGE = 20
export const TOP_CONTRIBUTORS_COUNT = 3
const CONTRIBUTOR_NOTES_PER_PAGE = 12

export type ContributorSort = "contributions" | "recent" | "name"

export interface ContributorListItem {
  id: string
  displayName: string
  username: string
  avatarUrl: string | null
  publishedNoteCount: number
  joinedAt: Date
  topSubject: string | null
}

export interface ContributorStats {
  totalContributors: number
  totalNotesShared: number
  totalSubjects: number
}

export interface ContributorDetail {
  id: string
  displayName: string
  username: string
  email: string
  avatarUrl: string | null
  bio: string | null
  joinedAt: Date
  publishedNoteCount: number
  subjects: string[]
}

export type ContributorNoteItem = Omit<PublicNote, "contributor">

/**
 * Site-wide contributor statistics. Computed entirely from PUBLISHED notes —
 * nothing is stored on the user row.
 */
export async function getContributorStats(): Promise<ContributorStats> {
  const [row] = await db
    .select({
      totalContributors: sql<number>`count(distinct ${notes.contributorId})`,
      totalNotesShared: sql<number>`count(${notes.id})`,
      totalSubjects: sql<number>`count(distinct ${notes.subject})`,
    })
    .from(notes)
    .where(eq(notes.status, "PUBLISHED"))

  return {
    totalContributors: Number(row?.totalContributors ?? 0),
    totalNotesShared: Number(row?.totalNotesShared ?? 0),
    totalSubjects: Number(row?.totalSubjects ?? 0),
  }
}

/**
 * Subquery: one row per contributor with their PUBLISHED note count.
 * Reused everywhere so "who counts as a contributor" is defined in one place.
 */
function publishedCountsSubquery() {
  return db
    .select({
      contributorId: notes.contributorId,
      publishedNoteCount: sql<number>`count(${notes.id})`.as(
        "published_note_count"
      ),
      publishedNoteAt: sql<Date>`max(${notes.publishedAt})`.as(
        "published_note_at"
      ),
    })
    .from(notes)
    .where(eq(notes.status, "PUBLISHED"))
    .groupBy(notes.contributorId)
    .as("contributor_counts")
}

/**
 * Batch-fetch each contributor's most-published subject in a single query
 * (no N+1) using a window function to rank subjects per contributor.
 */
async function getTopSubjectsForUsers(
  userIds: string[]
): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map()

  const ranked = db
    .select({
      contributorId: notes.contributorId,
      subject: notes.subject,
      rn: sql<number>`row_number() over (
        partition by ${notes.contributorId}
        order by count(*) desc, ${notes.subject} asc
      )`.as("rn"),
    })
    .from(notes)
    .where(
      and(eq(notes.status, "PUBLISHED"), inArray(notes.contributorId, userIds))
    )
    .groupBy(notes.contributorId, notes.subject)
    .as("ranked_subjects")

  const rows = await db
    .select({
      contributorId: ranked.contributorId,
      subject: ranked.subject,
    })
    .from(ranked)
    .where(eq(ranked.rn, 1))

  const map = new Map<string, string>()
  for (const row of rows) {
    map.set(row.contributorId, row.subject)
  }
  return map
}

/**
 * Top N contributors by published note count, deterministic tiebreak on
 * username so ties don't reshuffle between renders.
 */
export async function getTopContributors(): Promise<ContributorListItem[]> {
  try {
    const counts = publishedCountsSubquery()

    const rows = await db
      .select({
        id: users.id,
        displayName: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
        joinedAt: users.createdAt,
        publishedNoteCount: counts.publishedNoteCount,
      })
      .from(counts)
      .innerJoin(users, eq(counts.contributorId, users.id))
      .orderBy(
        desc(counts.publishedNoteCount),
        asc(users.username),
        desc(counts.publishedNoteAt)
      )
      .limit(TOP_CONTRIBUTORS_COUNT)

    const topSubjects = await getTopSubjectsForUsers(rows.map((r) => r.id))

    return rows.map((r) => ({
      ...r,
      publishedNoteCount: Number(r.publishedNoteCount),
      topSubject: topSubjects.get(r.id) ?? null,
    }))
  } catch (error) {
    console.error("getTopContributors failed:", error)
    throw error
  }
}

interface GetContributorsParams {
  search?: string
  sort?: ContributorSort
  page?: number
  pageSize?: number
}

interface GetContributorsResult {
  contributors: ContributorListItem[]
  totalCount: number
  totalPages: number
  page: number
}

/**
 * Paginated, searchable, sortable contributor list. A user only appears
 * here if the inner join to `contributor_counts` matches — i.e. they have
 * at least one PUBLISHED note. Search and count both hit the database;
 * nothing is loaded into memory and filtered in JS.
 */
export async function getContributors({
  search,
  sort = "contributions",
  page = 1,
  pageSize = CONTRIBUTORS_PER_PAGE,
}: GetContributorsParams): Promise<GetContributorsResult> {
  const counts = publishedCountsSubquery()
  const safePage = Math.max(1, page)
  const trimmedSearch = search?.trim()

  const searchCondition = trimmedSearch
    ? or(
        ilike(users.name, `%${trimmedSearch}%`),
        ilike(users.username, `%${trimmedSearch}%`)
      )
    : undefined

  const orderBy =
    sort === "recent"
      ? [desc(users.createdAt), asc(users.username)]
      : sort === "name"
        ? [asc(users.name), asc(users.username)]
        : [desc(counts.publishedNoteCount), asc(users.username)]

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: users.id,
        displayName: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
        joinedAt: users.createdAt,
        publishedNoteCount: counts.publishedNoteCount,
      })
      .from(counts)
      .innerJoin(users, eq(counts.contributorId, users.id))
      .where(searchCondition)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset((safePage - 1) * pageSize),
    db
      .select({ total: sql<number>`count(*)` })
      .from(counts)
      .innerJoin(users, eq(counts.contributorId, users.id))
      .where(searchCondition),
  ])

  const totalCount = Number(totalRow[0]?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const topSubjects = await getTopSubjectsForUsers(rows.map((r) => r.id))

  return {
    contributors: rows.map((r) => ({
      ...r,
      publishedNoteCount: Number(r.publishedNoteCount),
      topSubject: topSubjects.get(r.id) ?? null,
    })),
    totalCount,
    totalPages,
    page: safePage,
  }
}

/**
 * Single contributor by username. Returns null both when the user doesn't
 * exist AND when they exist but have zero PUBLISHED notes — either way
 * they are not a public contributor, so callers should 404.
 */
export async function getContributorByUsername(
  username: string
): Promise<ContributorDetail | null> {
  const counts = publishedCountsSubquery()

  const [row] = await db
    .select({
      id: users.id,
      displayName: users.name,
      username: users.username,
      email: users.email,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      joinedAt: users.createdAt,
      publishedNoteCount: counts.publishedNoteCount,
    })
    .from(users)
    .innerJoin(counts, eq(counts.contributorId, users.id))
    .where(ilike(users.username, username))
    .limit(1)

  if (!row) return null

  const subjectRows = await db
    .selectDistinct({ subject: notes.subject })
    .from(notes)
    .where(and(eq(notes.contributorId, row.id), eq(notes.status, "PUBLISHED")))
    .orderBy(asc(notes.subject))

  return {
    ...row,
    publishedNoteCount: Number(row.publishedNoteCount),
    subjects: subjectRows.map((s) => s.subject),
  }
}

/**
 * A contributor's PUBLISHED notes only. PENDING_REVIEW / REJECTED / REMOVED
 * / DRAFT notes are never selectable here — the WHERE clause is hardcoded,
 * not passed in, so this function can't accidentally leak them.
 */
export async function getContributorPublishedNotes(
  contributorId: string,
  page = 1
): Promise<{
  notes: PublicNote[]
  totalCount: number
  totalPages: number
}> {
  const safePage = Math.max(1, page)

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: notes.id,
        slug: notes.slug,
        title: notes.title,
        description: notes.description,
        subject: notes.subject,
        category: notes.category,
        educationLevel: notes.educationLevel,
        grade: notes.grade,
        publishedAt: notes.publishedAt,
        downloadCount: notes.downloadCount,
        academicYear: notes.academicYear,
        tags: notes.tags,
        pageCount: notes.pageCount,
        fileSizeBytes: notes.fileSizeBytes,
        course: notes.course,
        topic: notes.topic,
        filePath: notes.filePath,
        contributorId: users.id,
        contributorName: users.name,
        contributorUsername: users.username,
        contributorAvatarUrl: users.avatarUrl,

        sourceType: notes.sourceType,
        sourceUrl: notes.sourceUrl,
        originalAuthor: notes.originalAuthor,
      })
      .from(notes)
      .innerJoin(users, eq(notes.contributorId, users.id))
      .where(
        and(
          eq(notes.contributorId, contributorId),
          eq(notes.status, "PUBLISHED")
        )
      )
      .orderBy(desc(notes.publishedAt))
      .limit(CONTRIBUTOR_NOTES_PER_PAGE)
      .offset((safePage - 1) * CONTRIBUTOR_NOTES_PER_PAGE),
    db
      .select({ total: sql<number>`count(*)` })
      .from(notes)
      .where(
        and(
          eq(notes.contributorId, contributorId),
          eq(notes.status, "PUBLISHED")
        )
      ),
  ])

  const totalCount = Number(totalRow[0]?.total ?? 0)

  return {
    notes: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      subject: r.subject,
      category: r.category,
      educationLevel: r.educationLevel,
      grade: r.grade,
      publishedAt: r.publishedAt ? new Date(r.publishedAt) : new Date(),
      downloadCount: Number(r.downloadCount),
      academicYear: r.academicYear,
      tags: r.tags || [],
      pageCount: Number(r.pageCount),
      fileSizeBytes: Number(r.fileSizeBytes),
      course: r.course,
      description: r.description,
      filePath: r.filePath,
      topic: r.topic,
      originalAuthor: r.originalAuthor,
      sourceType: r.sourceType,
      sourceUrl: r.sourceUrl,
      contributor: {
        id: r.contributorId,
        name: r.contributorName,
        username: r.contributorUsername,
        avatarUrl: r.contributorAvatarUrl,
      },
    })),
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / CONTRIBUTOR_NOTES_PER_PAGE)),
  }
}
