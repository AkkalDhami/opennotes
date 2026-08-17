import Link from "next/link"
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react"
import {
  Clock01Icon,
  Flag02Icon,
  UserGroupIcon,
  BookOpen01Icon,
  File01Icon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Route } from "next"

const ACTIONS: { icon: IconSvgElement; label: string; href: string }[] = [
  {
    icon: Clock01Icon,
    label: "Review Notes",
    href: "/admin/notes?status=PENDING_REVIEW",
  },
  {
    icon: Flag02Icon,
    label: "Review Reports",
    href: "/admin/reports?status=OPEN",
  },
  {
    icon: UserGroupIcon,
    label: "Manage Contributors",
    href: "/admin/contributors",
  },
  { icon: BookOpen01Icon, label: "Manage Subjects", href: "/admin/subjects" },
  { icon: File01Icon, label: "View All Notes", href: "/admin/notes" },
  { icon: ArrowUpRight01Icon, label: "View Platform", href: "/" },
]

export function QuickActions() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium tracking-tight text-foreground">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ACTIONS.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            nativeButton={false}
            className="h-auto flex-col gap-2 py-4"
            render={
              <Link href={action.href as Route}>
                <HugeiconsIcon
                  icon={action.icon}
                  size={18}
                  color="currentColor"
                  strokeWidth={2}
                  className="size-4.5"
                />
                <span className="text-xs font-medium">{action.label}</span>
              </Link>
            }
          />
        ))}
      </div>
    </section>
  )
}
