import "server-only"

import { and, count, desc, eq, ilike, or } from "drizzle-orm"

import { db, users } from "@/db"

export type UserRole = "USER" | "MODERATOR" | "ADMIN"

export interface AdminUser {
  id: string
  name: string | null
  username: string | null
  bio: string | null
  email: string
  emailVerified: boolean | null
  avatar: string | null
  role: UserRole
  createdAt: Date
}

export interface GetUsersParams {
  search?: string
  role?: UserRole
  verified?: boolean
  page?: number
  limit?: number
}

export interface GetUsersResult {
  users: AdminUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const DEFAULT_USERS_PAGE_SIZE = 20

export async function getUsers({
  search,
  role,
  verified,
  page = 1,
  limit = DEFAULT_USERS_PAGE_SIZE,
}: GetUsersParams = {}): Promise<GetUsersResult> {
  const conditions = []

  const trimmedSearch = search?.trim()
  if (trimmedSearch) {
    const term = `%${trimmedSearch}%`
    conditions.push(
      or(
        ilike(users.name, term),
        ilike(users.username, term),
        ilike(users.email, term)
      )
    )
  }

  if (role) {
    conditions.push(eq(users.role, role))
  }

  if (verified !== undefined) {
    conditions.push(eq(users.emailVerified, verified))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const safePage = Math.max(1, Math.floor(page))
  const safeLimit = Math.max(1, Math.floor(limit))
  const offset = (safePage - 1) * safeLimit

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        bio: users.bio,
        email: users.email,
        emailVerified: users.emailVerified,
        avatar: users.avatarUrl,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(safeLimit)
      .offset(offset),
    db.select({ value: count() }).from(users).where(where),
  ])

  const total = totalRows[0]?.value ?? 0

  return {
    users: rows,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  }
}
