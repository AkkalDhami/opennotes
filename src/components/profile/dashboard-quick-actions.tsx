import Link from "next/link"
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react"
import {
  FileUploadIcon,
  File01Icon,
  HeartIcon,
  Folder01Icon,
  Settings02Icon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Route } from "next"

const ACTIONS: { icon: IconSvgElement; label: string; href: string }[] = [
  {
    icon: FileUploadIcon,
    label: "Share Notes",
    href: "/contribution",
  },
  {
    icon: File01Icon,
    label: "My Notes",
    href: "/profile/notes",
  },
  {
    icon: HeartIcon,
    label: "Saved Notes",
    href: "/profile/saved-notes",
  },
  {
    icon: Folder01Icon,
    label: "Collections",
    href: "/profile/collections",
  },
  {
    icon: Settings02Icon,
    label: "Settings",
    href: "/profile/settings",
  },
  {
    icon: ArrowUpRight01Icon,
    label: "Browse Notes",
    href: "/notes",
  },
]

export function DashboardQuickActions() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium tracking-tight text-foreground">
        Quick actions
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
