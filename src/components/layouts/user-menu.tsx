"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserType } from "@/types/auth"
import { UserAvatar } from "@/components/admin/users/user-avatar"
import { logoutUser } from "@/lib/auth/logout-user"
import { useTransition } from "react"
import { toast } from "react-hot-toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare03Icon,
  LogoutIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"

export function UserMenu({
  user,
}: {
  user: Pick<UserType, "avatar" | "id" | "name" | "username" | "role">
}) {
  const [isPending, startTransition] = useTransition()

  const handleLogout = async () => {
    startTransition(async () => {
      const res = await logoutUser(user.id)
      if (res) {
        toast.success("Logout successfully")
      } else {
        toast.error("Logout failed")
      }
    })
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <UserAvatar avatarUrl={user.avatar ?? ""} name={user?.name ?? ""} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className={"w-44"}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem render={<Link href={"/profile"} />}>
              <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
              My Profile
            </DropdownMenuItem>
            {user.role === "ADMIN" && (
              <DropdownMenuItem render={<Link href={"/admin/dashboard"} />}>
                <HugeiconsIcon icon={DashboardSquare03Icon} strokeWidth={2} />
                Admin Dashboard
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              variant="destructive"
            >
              <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
