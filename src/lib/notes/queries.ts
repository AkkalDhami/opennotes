import "server-only"
import { db, notes, NoteStatus, users } from "@/db"
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm"
import { ContributionFiltersInput } from "@/validations/contribution-filter"

const PAGE_SIZE = 20

// ---------------------------------------------------------------------------
// Stats (four summary cards)
// ---------------------------------------------------------------------------

export interface AdminContributionStats {
  pendingReview: number
  published: number
  rejected: number
  contributors: number
}

export async function getAdminContributionStats(): Promise<AdminContributionStats> {
  const [row] = await db
    .select({
      pendingReview: sql<number>`count(*) filter (where ${notes.status} = 'PENDING_REVIEW')`,
      published: sql<number>`count(*) filter (where ${notes.status} = 'PUBLISHED')`,
      rejected: sql<number>`count(*) filter (where ${notes.status} = 'REJECTED')`,
      contributors: sql<number>`count(distinct ${notes.contributorId}) filter (where ${notes.status} = 'PUBLISHED')`,
    })
    .from(notes)

  return {
    pendingReview: Number(row?.pendingReview ?? 0),
    published: Number(row?.published ?? 0),
    rejected: Number(row?.rejected ?? 0),
    contributors: Number(row?.contributors ?? 0),
  }
}

export interface AdminContributionRow {
  id: string
  slug: string

  title: string
  description: string | null

  subject: string
  category: string

  educationLevel: string | null
  course: string | null
  grade: string | null

  topic: string | null
  academicYear: string | null
  tags: string[]

  status: NoteStatus

  createdAt: Date

  contributor: {
    id: string
    name: string
    username: string
    avatar: string | null
  }
}

export interface GetAdminContributionsResult {
  items: AdminContributionRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

function buildContributionWhere(
  filters: ContributionFiltersInput
): SQL | undefined {
  const conditions: SQL[] = []

  if (filters.status !== "ALL") {
    conditions.push(eq(notes.status, filters.status))
  }

  if (filters.search) {
    const term = `%${filters.search}%`
    const searchCondition = or(
      ilike(notes.title, term),
      ilike(users.name, term),
      ilike(users.username, term),
      ilike(users.email, term)
    )
    if (searchCondition) conditions.push(searchCondition)
  }

  if (filters.subject) {
    conditions.push(ilike(notes.subject, `%${filters.subject}%`))
  }

  if (filters.category) {
    conditions.push(ilike(notes.category, `%${filters.category}%`))
  }

  if (filters.educationLevel) {
    conditions.push(eq(notes.educationLevel, filters.educationLevel))
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom)
    if (!Number.isNaN(from.getTime()))
      conditions.push(gte(notes.createdAt, from))
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo)
    if (!Number.isNaN(to.getTime())) conditions.push(lte(notes.createdAt, to))
  }

  return conditions.length ? and(...conditions) : undefined
}

export async function getAdminContributions(
  filters: ContributionFiltersInput
): Promise<GetAdminContributionsResult> {
  const page = filters.page ?? 1
  const pageSize = PAGE_SIZE
  const where = buildContributionWhere(filters)

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
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
        tags: notes.tags,

        status: notes.status,
        createdAt: notes.createdAt,

        contributorId: users.id,
        contributorName: users.name,
        contributorUsername: users.username,
        contributorAvatar: users.avatarUrl,
      })
      .from(notes)
      .innerJoin(users, eq(notes.contributorId, users.id))
      .where(where)
      .orderBy(desc(notes.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ total: sql<number>`count(*)` })
      .from(notes)
      .innerJoin(users, eq(notes.contributorId, users.id))
      .where(where),
  ])

  const items: AdminContributionRow[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,

    subject: r.subject,
    category: r.category,

    educationLevel: r.educationLevel,
    course: r.course,
    grade: r.grade,

    topic: r.topic,
    academicYear: r.academicYear,
    tags: r.tags ?? [],

    status: r.status,
    createdAt: r.createdAt,

    contributor: {
      id: r.contributorId,
      name: r.contributorName,
      username: r.contributorUsername,
      avatar: r.contributorAvatar,
    },
  }))

  const totalCount = Number(total ?? 0)

  return {
    items,
    total: totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  }
}

// ---------------------------------------------------------------------------
// Single contribution (detail/review page)
// ---------------------------------------------------------------------------

export interface AdminContributionDetail {
  id: string
  slug: string
  title: string
  description: string | null
  subject: string
  category: string
  educationLevel: string | null
  grade: string | null
  topic: string | null
  academicYear: string | null
  fileKey: string
  fileSizeBytes: number
  pageCount: number | null
  processingStatus: "PROCESSING" | "READY" | "FAILED"
  status: NoteStatus
  rejectionReason: string | null
  downloadCount: number
  createdAt: Date
  publishedAt: Date | null
  contributor: {
    id: string
    name: string
    username: string
    email: string
    avatar: string | null
  }
}

export async function getAdminContributionById(
  id: string
): Promise<AdminContributionDetail | null> {
  const [row] = await db
    .select({
      id: notes.id,
      slug: notes.slug,
      title: notes.title,
      description: notes.description,
      subject: notes.subject,
      category: notes.category,
      educationLevel: notes.educationLevel,
      grade: notes.grade,
      topic: notes.topic,
      academicYear: notes.academicYear,
      fileKey: notes.fileKey,
      fileSizeBytes: notes.fileSizeBytes,
      pageCount: notes.pageCount,
      processingStatus: notes.processingStatus,
      status: notes.status,
      downloadCount: notes.downloadCount,
      createdAt: notes.createdAt,
      publishedAt: notes.publishedAt,
      contributorId: users.id,
      contributorName: users.name,
      contributorUsername: users.username,
      contributorEmail: users.email,
      contributorAvatar: users.avatarUrl,
      rejectionReason: notes.rejectionReason,
    })
    .from(notes)
    .innerJoin(users, eq(notes.contributorId, users.id))
    .where(eq(notes.id, id))
    .limit(1)

  if (!row) return null

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    subject: row.subject,
    category: row.category,

    educationLevel: row.educationLevel,
    grade: row.grade,
    topic: row.topic,
    academicYear: row.academicYear,
    fileKey: row.fileKey,
    fileSizeBytes: row.fileSizeBytes,
    pageCount: row.pageCount,
    processingStatus: row.processingStatus,
    status: row.status,
    downloadCount: row.downloadCount,
    createdAt: row.createdAt,
    publishedAt: row.publishedAt,
    rejectionReason: row.status === "REJECTED" ? row.rejectionReason : null,
    contributor: {
      id: row.contributorId,
      name: row.contributorName,
      username: row.contributorUsername,
      email: row.contributorEmail,
      avatar: row.contributorAvatar,
    },
  }
}

// ---------------------------------------------------------------------------
// Per-contributor stats (shown in the detail page sidebar)
// ---------------------------------------------------------------------------

export interface ContributorStats {
  published: number
  pending: number
  rejected: number
}

export async function getContributorStats(
  contributorId: string
): Promise<ContributorStats> {
  const [row] = await db
    .select({
      published: sql<number>`count(*) filter (where ${notes.status} = 'PUBLISHED')`,
      pending: sql<number>`count(*) filter (where ${notes.status} = 'PENDING_REVIEW')`,
      rejected: sql<number>`count(*) filter (where ${notes.status} = 'REJECTED')`,
    })
    .from(notes)
    .where(eq(notes.contributorId, contributorId))

  return {
    published: Number(row?.published ?? 0),
    pending: Number(row?.pending ?? 0),
    rejected: Number(row?.rejected ?? 0),
  }
}

// ---------------------------------------------------------------------------
// Public contributors (ranking) — a user counts as a contributor ONLY when
// they have at least one PUBLISHED note. Never stored/incremented manually.
// ---------------------------------------------------------------------------

export interface PublicContributor {
  id: string
  name: string
  username: string
  avatar: string | null
  publishedCount: number
}

export async function getPublicContributors(
  options: { limit?: number; offset?: number } = {}
): Promise<PublicContributor[]> {
  const { limit = 50, offset = 0 } = options

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      avatar: users.avatarUrl,
      publishedCount: sql<number>`count(${notes.id})`,
    })
    .from(notes)
    .innerJoin(users, eq(notes.contributorId, users.id))
    .where(eq(notes.status, "PUBLISHED"))
    .groupBy(
      users.id,
      users.name,
      users.username,
      users.avatarUrl,
      users.createdAt
    )
    .orderBy(desc(sql`count(${notes.id})`), asc(users.createdAt))
    .limit(limit)
    .offset(offset)

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    username: r.username,
    avatar: r.avatar,
    publishedCount: Number(r.publishedCount),
  }))
}

export async function getPublishedContributorCount(): Promise<number> {
  const [row] = await db
    .select({
      count: sql<number>`count(distinct ${notes.contributorId})`,
    })
    .from(notes)
    .where(eq(notes.status, "PUBLISHED"))

  return Number(row?.count ?? 0)
}
