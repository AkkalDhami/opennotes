import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db, notes, reports, ReportType, users } from "@/db"

const reporterUsers = alias(users, "reporter_users")
const contributorUsers = alias(users, "contributor_users")

export type ReportListItem = {
  id: string
  reason: ReportType["reason"]
  status: ReportType["status"]
  createdAt: Date
  note: {
    id: string
    slug: string
    title: string
    contributorName: string
  }
  reporter: { id: string; name: string; username: string } | null
}

export type ReportListFilters = {
  status?: "OPEN" | "RESOLVED" | "DISMISSED"
  search?: string
  page?: number
  pageSize?: number
  sort?: "newest" | "oldest"
}

export type ReportListResult = {
  items: ReportListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getReports(
  filters: ReportListFilters = {}
): Promise<ReportListResult> {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20))
  const offset = (page - 1) * pageSize

  const conditions: SQL[] = []

  if (filters.status) {
    conditions.push(eq(reports.status, filters.status))
  }

  const search = filters.search?.trim()
  if (search) {
    const term = `%${search}%`
    const searchCondition = or(
      ilike(notes.title, term),
      ilike(contributorUsers.username, term),
      ilike(reporterUsers.username, term),
      ilike(reports.explanation, term)
    )
    if (searchCondition) conditions.push(searchCondition)
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  const orderBy =
    filters.sort === "oldest" ? asc(reports.createdAt) : desc(reports.createdAt)

  const baseQuery = db
    .select({
      id: reports.id,
      reason: reports.reason,
      status: reports.status,
      createdAt: reports.createdAt,
      noteId: notes.id,
      noteSlug: notes.slug,
      noteTitle: notes.title,
      contributorName: contributorUsers.name,
      reporterId: reporterUsers.id,
      reporterName: reporterUsers.name,
      reporterUsername: reporterUsers.username,
    })
    .from(reports)
    .innerJoin(notes, eq(reports.noteId, notes.id))
    .innerJoin(contributorUsers, eq(notes.contributorId, contributorUsers.id))
    .leftJoin(reporterUsers, eq(reports.reporterId, reporterUsers.id))

  const countQuery = db
    .select({ value: count() })
    .from(reports)
    .innerJoin(notes, eq(reports.noteId, notes.id))
    .innerJoin(contributorUsers, eq(notes.contributorId, contributorUsers.id))
    .leftJoin(reporterUsers, eq(reports.reporterId, reporterUsers.id))

  const [rows, totalRow] = await Promise.all([
    (whereClause ? baseQuery.where(whereClause) : baseQuery)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset),
    whereClause ? countQuery.where(whereClause) : countQuery,
  ])

  const items: ReportListItem[] = rows.map((r) => ({
    id: r.id,
    reason: r.reason,
    status: r.status,
    createdAt: r.createdAt,
    note: {
      id: r.noteId,
      slug: r.noteSlug,
      title: r.noteTitle,
      contributorName: r.contributorName,
    },
    reporter: r.reporterId
      ? {
          id: r.reporterId,
          name: r.reporterName!,
          username: r.reporterUsername!,
        }
      : null,
  }))

  const total = Number(totalRow[0]?.value ?? 0)

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}
