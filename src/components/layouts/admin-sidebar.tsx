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
  useSidebar,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { FileStarIcon, LayoutBottomIcon, UserGroup03Icon } from "@hugeicons/core-free-icons"
import { AdminProfile } from "@/components/admin/admin-profile"
import { APP_NAME } from "@/constants/app.constants"

import {
  DashboardSquare02Icon,
  File01Icon,
  UserGroupIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import { UserType } from "@/types/auth"

const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: <HugeiconsIcon icon={DashboardSquare02Icon} strokeWidth={2} />,
    },
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: <HugeiconsIcon icon={DashboardSquare02Icon} strokeWidth={2} />,
    },
    {
      title: "All Notes",
      url: "/admin/notes",
      icon: <HugeiconsIcon icon={File01Icon} strokeWidth={2} />,
    },
    {
      title: "Contributions",
      url: "/admin/contributions",
      icon: <HugeiconsIcon icon={FileStarIcon} strokeWidth={2} />,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
    },
    {
      title: "Contributors",
      url: "/admin/contributors",
      icon: <HugeiconsIcon icon={UserGroup03Icon} strokeWidth={2} />,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />,
    },
  ],
}

export function AdminSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UserType }) {
  const { open } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-brand text-background">
                <HugeiconsIcon
                  icon={LayoutBottomIcon}
                  strokeWidth={2}
                  className="size-4"
                />
              </div>
              {open && <span className="text-xl font-medium">{APP_NAME}</span>}
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