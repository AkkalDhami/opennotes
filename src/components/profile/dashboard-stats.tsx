import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react"
import {
  File01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Download01Icon,
  ViewIcon,
  HeartIcon,
  Folder01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { UserDashboardStats } from "@/lib/user/get-dashboard"

interface DashboardStatsProps {
  stats: UserDashboardStats
}

interface StatCardConfig {
  label: string
  value: number
  description: string
  icon: IconSvgElement
  tone?: "default" | "warning"
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards: StatCardConfig[] = [
    {
      label: "Notes",
      value: stats.total,
      description: "Notes you have shared",
      icon: File01Icon,
    },
    {
      label: "Published",
      value: stats.published,
      description: "Visible to students",
      icon: CheckmarkCircle02Icon,
    },
    {
      label: "Pending review",
      value: stats.pendingReview,
      description: "Waiting for moderation",
      icon: Clock01Icon,
      tone: stats.pendingReview > 0 ? "warning" : "default",
    },
    {
      label: "Downloads",
      value: stats.totalDownloads,
      description: "Across your notes",
      icon: Download01Icon,
    },
    {
      label: "Views",
      value: stats.totalViews,
      description: "Across your notes",
      icon: ViewIcon,
    },
    {
      label: "Saved notes",
      value: stats.savedNotes,
      description: "Bookmarked for later",
      icon: HeartIcon,
    },
    {
      label: "Collections",
      value: stats.collections,
      description: "Your study collections",
      icon: Folder01Icon,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-start justify-between gap-4 rounded-lg border p-4"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {card.label}
            </p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {card.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </div>
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-foreground",
              card.tone === "warning" &&
                "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400"
            )}
          >
            <HugeiconsIcon
              icon={card.icon}
              size={18}
              color="currentColor"
              strokeWidth={2}
              className="size-4.5"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
