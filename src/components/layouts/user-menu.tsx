"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserType } from "@/types/auth"
import { UserAvatar } from "@/components/admin/users/user-avatar"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare03Icon,
  LogoutIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogoutAlertDialog } from "@/components/settings/sessions/logout-alert-dialog"
import { THEME_PREVIEWS, ThemeName } from "@/lib/appearance/themes"
import { useAppearanceStore } from "@/hooks/use-appearance-store"
import { cn } from "@/lib/utils"

export function UserMenu({
  user,
}: {
  user: Pick<UserType, "avatar" | "id" | "name" | "username" | "role">
}) {
  const router = useRouter()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const theme = useAppearanceStore((s) => s.theme)
  const setTheme = useAppearanceStore((s) => s.setTheme)

  function handleLogoutSuccess() {
    toast.success("Logout successfully")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar avatarUrl={user.avatar ?? ""} name={user?.name ?? ""} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={"w-64"}>
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
          <DropdownMenuLabel className="mt-2">Color theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as ThemeName)}
            className="grid grid-cols-7 gap-1.5 px-2 py-1"
          >
            {THEME_PREVIEWS.map((t) => {
              const label = `${t.name} theme: ${t.description}`

              return (
                <DropdownMenuRadioItem
                  key={t.id}
                  value={t.id}
                  aria-label={label}
                  title={label}
                  style={{ backgroundColor: t.preview.primary }}
                  className={cn(
                    "size-7 cursor-pointer justify-center rounded-full border-2 border-background p-0 ring-1 ring-border",
                    "**:data-[slot=dropdown-menu-radio-item-indicator]:hidden",
                    "aria-checked:ring-2 aria-checked:ring-primary aria-checked:ring-offset-2 aria-checked:ring-offset-background"
                  )}
                ></DropdownMenuRadioItem>
              )
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => setLogoutOpen(true)}
            variant="destructive"
          >
            <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
      <LogoutAlertDialog
        intent={{ kind: "current" }}
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onSuccess={handleLogoutSuccess}
      />
    </DropdownMenu>
  )
}
