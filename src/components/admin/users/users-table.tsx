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
import type { AdminUser } from "@/lib/admin/users"

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
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Email Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
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
                    <span className="font-medium text-foreground group-hover:underline">
                      {displayName}
                    </span>
                  </Link>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {user.username ? `@${user.username}` : "—"}
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
                  {formatJoinedDate(user.createdAt)}
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
