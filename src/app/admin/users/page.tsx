import { requireAdmin } from "@/lib/auth/require-admin"
import { getUsers, DEFAULT_USERS_PAGE_SIZE, UserRole } from "@/lib/admin/users"

import { UsersPageHeader } from "@/components/admin/users/users-page-header"
import { UsersFilters } from "@/components/admin/users/users-filters"
import { UsersTable } from "@/components/admin/users/users-table"
import { UsersPagination } from "@/components/admin/users/users-pagination"
import { UsersEmptyState } from "@/components/admin/users/users-empty-state"
import { RefreshButton } from "@/components/admin/contributions/refresh-button"

export const metadata = {
  title: "Users · Admin",
  description: "Manage users",
}

interface AdminUsersPageProps {
  searchParams: Promise<{
    search?: string
    role?: string
    verified?: string
    page?: string
  }>
}

function parseRole(value?: UserRole): UserRole | undefined {
  return value === "USER" || value === "ADMIN" ? value : undefined
}

function parseVerified(value?: string): boolean | undefined {
  if (value === "true") return true
  if (value === "false") return false
  return undefined
}

function parsePage(value?: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  // Authorization must be enforced here, not just in middleware.
  await requireAdmin()

  const params = await searchParams
  const search = params.search?.trim() || undefined
  const role = parseRole(params.role?.toUpperCase() as UserRole | undefined)
  const verified = parseVerified(params.verified)
  const page = parsePage(params.page)

  const { users, total, totalPages } = await getUsers({
    search,
    role,
    verified,
    page,
    limit: DEFAULT_USERS_PAGE_SIZE,
  })

  const hasActiveFilters = Boolean(search || role || verified !== undefined)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <UsersPageHeader total={total} />
        <RefreshButton />
      </div>

      <UsersFilters
        search={search ?? ""}
        role={role}
        verified={verified}
        hasActiveFilters={hasActiveFilters}
      />

      {users.length === 0 ? (
        <UsersEmptyState hasActiveFilters={hasActiveFilters} />
      ) : (
        <>
          <UsersTable users={users} />
          <UsersPagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={DEFAULT_USERS_PAGE_SIZE}
            searchParams={{
              search: params.search,
              role: params.role,
              verified: params.verified,
            }}
          />
        </>
      )}
    </div>
  )
}
