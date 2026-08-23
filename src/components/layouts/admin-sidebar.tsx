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
  Flag02Icon,
  Home03Icon,
  UserGroup03Icon,
} from "@hugeicons/core-free-icons"
import { UserProfile } from "@/components/shared/user-profile"

import {
  DashboardSquare02Icon,
  File01Icon,
  UserGroupIcon,
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
      url: "/admin/dashboard",
      icon: DashboardSquare02Icon,
    },
    {
      title: "All Notes",
      url: "/admin/notes",
      icon: File01Icon,
    },
    {
      title: "Contributions",
      url: "/admin/contributions",
      icon: FileStarIcon,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: UserGroupIcon,
    },
    {
      title: "Contributors",
      url: "/admin/contributors",
      icon: UserGroup03Icon,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: Flag02Icon,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings02Icon,
    },
  ],
}

export function AdminSidebar({
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
        <UserProfile user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
