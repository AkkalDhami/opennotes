"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { isActiveLink } from "@/utils/check-active-link"
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react"
import { Route } from "next"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: IconSvgElement
  }[]
}) {
  const pathname = usePathname()

  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = isActiveLink(pathname, item.url)
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={item.title}
                size={"default"}
                render={<Link href={item.url as Route} />}
                onClick={() => isMobile && setOpenMobile(false)}
                className="gap-3"
              >
                {item.icon && (
                  <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                )}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
