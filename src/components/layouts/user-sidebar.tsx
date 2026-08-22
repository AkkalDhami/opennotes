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
  Bookmark02Icon,
  FileStarIcon,
  Folder01Icon,
  FolderHeartIcon,
  Home03Icon,
} from "@hugeicons/core-free-icons"
import { AdminProfile } from "@/components/admin/admin-profile"

import {
  DashboardSquare02Icon,
  File01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import { UserType } from "@/types/auth"
import { Logo } from "@/components/shared/logo"

const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home03Icon,
    },
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
      icon: Bookmark02Icon,
    },
    {
      title: "My Collections",
      url: "/profile/collections",
      icon: Folder01Icon,
    },
    {
      title: "Saved Collections",
      url: "/profile/saved-collections",
      icon: FolderHeartIcon,
    },
    {
      title: "Contributions",
      url: "/profile/contributions",
      icon: FileStarIcon,
    },
    {
      title: "Settings",
      url: "/profile/settings",
      icon: Settings02Icon,
    },
  ],
}

export function UserSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UserType }) {
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <AdminProfile user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
