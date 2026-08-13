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
import { LayoutBottomIcon } from "@hugeicons/core-free-icons"
import { AdminProfile } from "@/components/admin/admin-profile"
import { APP_NAME } from "@/constants/app.constant"

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
      title: "Dashboard",
      url: "#",
      icon: <HugeiconsIcon icon={DashboardSquare02Icon} strokeWidth={2} />,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/",
        },
        {
          title: "Dashboard",
          url: "/admin/dashboard",
        },
      ],
    },

    {
      title: "Content",
      url: "#",
      icon: <HugeiconsIcon icon={File01Icon} strokeWidth={2} />,
      items: [
        {
          title: "All Notes",
          url: "/admin/notes",
        },
        {
          title: "Pending Reviews",
          url: "/admin/notes/pending",
        },
        {
          title: "Subjects",
          url: "/admin/subjects",
        },
      ],
    },

    {
      title: "Community",
      url: "#",
      icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
      items: [
        {
          title: "Users",
          url: "/admin/users",
        },
        {
          title: "Contributors",
          url: "/admin/contributors",
        },
        {
          title: "Reports",
          url: "/admin/reports",
        },
      ],
    },

    {
      title: "Settings",
      url: "#",
      icon: <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />,
      items: [
        {
          title: "General",
          url: "/admin/settings",
        },
      ],
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
