"use client"

import * as React from "react"

import { NavMain } from "@/components/layouts/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  FileStarIcon,
  Folder01Icon,
  HeartIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"
import { UserProfile } from "@/components/shared/user-profile"

import {
  DashboardSquare02Icon,
  File01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import { UserType } from "@/types/auth"
import { Logo } from "@/components/shared/logo"
import { usePathname } from "next/navigation"
import { ParsedProfileCta } from "@/components/profile/profile-cta"

export const USER_SIDEBAR_ITEMS = [
  {
    title: "Dashboard",
    url: "/profile/dashboard",
    icon: DashboardSquare02Icon,
  },
  {
    title: "My Notes",
    url: "/profile/notes",
    icon: File01Icon,
  },
  {
    title: "Saved Notes",
    url: "/profile/saved-notes",
    icon: HeartIcon,
  },
  {
    title: "My Collections",
    url: "/profile/collections",
    icon: Folder01Icon,
  },
  {
    title: "My Contributions",
    url: "/profile/contributions",
    icon: FileStarIcon,
  },
  {
    title: "Settings",
    url: "/profile/settings",
    icon: Settings02Icon,
  },
]

export function UserSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UserType }) {
  const pathname = usePathname()
  const navItems =
    user.role === "ADMIN"
      ? [
          {
            title: "Admin Dashboard",
            url: "/admin/dashboard",
            icon: Shield01Icon,
          },
          ...USER_SIDEBAR_ITEMS,
        ]
      : USER_SIDEBAR_ITEMS

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="mt-2 flex items-center gap-2">
              <Logo />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <ParsedProfileCta pathname={pathname} />
      </SidebarContent>

      <SidebarFooter>
        <UserProfile user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
