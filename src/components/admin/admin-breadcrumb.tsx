"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Route } from "next"

const labelMap: Record<string, string> = {
  admin: "Admin",
  notes: "Notes",
  pending: "Pending Reviews",
  subjects: "Subjects",
  users: "Users",
  contributors: "Contributors",
  reports: "Reports",
  settings: "Settings",
}

export function AdminBreadcrumb() {
  const pathname = usePathname()

  const segments = pathname.split("/").filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const isLast = index === segments.length - 1

          const label =
            labelMap[segment] ??
            segment
              .replace(/-/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())

          return (
            <div key={href} className="contents">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={href as Route}>{label}</Link>}
                  ></BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
