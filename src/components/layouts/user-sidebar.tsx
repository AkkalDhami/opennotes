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
import { HugeiconsIcon } from "@hugeicons/react"
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
      icon: <HugeiconsIcon icon={Home03Icon} strokeWidth={2} />,
    },
    {
      title: "Dashboard",
      url: "/profile/dashboard",
      icon: <HugeiconsIcon icon={DashboardSquare02Icon} strokeWidth={2} />,
    },
    {
      title: "My Notes",
      url: "/profile/notes",
      icon: <HugeiconsIcon icon={File01Icon} strokeWidth={2} />,
    },
    {
      title: "Saved Notes",
      url: "/profile/saved-notes",
      icon: <HugeiconsIcon icon={Bookmark02Icon} strokeWidth={2} />,
    },
    {
      title: "My Collections",
      url: "/profile/collections",
      icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />,
    },
    {
      title: "Saved Collections",
      url: "/profile/saved-collections",
      icon: <HugeiconsIcon icon={FolderHeartIcon} strokeWidth={2} />,
    },
    {
      title: "Contributions",
      url: "/profile/contributions",
      icon: <HugeiconsIcon icon={FileStarIcon} strokeWidth={2} />,
    },
    {
      title: "Settings",
      url: "/profile/settings",
      icon: <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />,
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
