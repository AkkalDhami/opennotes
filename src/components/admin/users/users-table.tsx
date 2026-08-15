import Link from "next/link"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/admin/users/user-avatar"
import { EmailStatus } from "@/components/admin/users/email-status"
import { UserRowActions } from "@/components/admin/users/user-row-actions"
import { AdminUser } from "@/lib/admin/users"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkBadge01Icon } from "@hugeicons/core-free-icons"
import { formatDate } from "@/utils/format-date"

interface UsersTableProps {
  users: AdminUser[]
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

function formatJoinedDate(date: Date) {
  return dateFormatter.format(date)
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Email Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-10">
              <span className="">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const displayName = user.name ?? "Unnamed user"

            return (
              <TableRow key={user.id} className="group">
                <TableCell>
                  <Link
                    href={`/admin/users/${user.username}`}
                    className="flex items-center gap-3 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                  >
                    <UserAvatar
                      name={user.name}
                      avatarUrl={user.avatar}
                      className="size-9"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 font-medium text-foreground group-hover:underline">
                        {displayName}
                        {user.emailVerified && (
                          <HugeiconsIcon
                            icon={CheckmarkBadge01Icon}
                            size={18}
                            color="currentColor"
                            strokeWidth={1.8}
                            className="size-4 fill-blue-600 stroke-blue-600 text-white"
                          />
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {user.username ? `@${user.username}` : "—"}
                      </span>
                    </div>
                  </Link>
                </TableCell>

                <TableCell>
                  <span
                    className="block max-w-56 truncate text-muted-foreground"
                    title={user.email}
                  >
                    {user.email}
                  </span>
                </TableCell>

                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "brand" : "outline"}>
                    {user.role === "ADMIN" ? "Admin" : "User"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <EmailStatus verified={user.emailVerified === true} />
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {formatDate(user.createdAt, {
                    dateStyle: "long",
                    timeStyle: "medium",
                  })}
                </TableCell>

                <TableCell>
                  <UserRowActions userId={user.id} userName={user.name} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
