import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Clock01Icon,
  Flag02Icon,
  CancelCircleIcon,
  Delete02Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

import { DashboardSectionError } from "./dashboard-section-error"
import {
  getModerationStats,
  ModerationStats,
} from "@/lib/admin/dashboard/get-moderation-stats"
import { Route } from "next"

function buildItems(stats: ModerationStats) {
  return [
    {
      icon: Clock01Icon,
      label: "Pending Notes",
      count: stats.pendingNotes,
      description: "Waiting for review",
      href: "/admin/notes?status=PENDING_REVIEW",
      cta: "Review notes",
    },
    {
      icon: Flag02Icon,
      label: "Open Reports",
      count: stats.openReports,
      description: "Reports need attention",
      href: "/admin/reports?status=OPEN",
      cta: "Review reports",
    },
    {
      icon: CancelCircleIcon,
      label: "Rejected Notes",
      count: stats.rejectedNotes,
      description: "Recently rejected",
      href: "/admin/notes?status=REJECTED",
      cta: "View rejected",
    },
    {
      icon: Delete02Icon,
      label: "Recently Removed",
      count: stats.recentlyRemoved,
      description: "Removed from public access",
      href: "/admin/notes?status=REMOVED",
      cta: "View removed",
    },
  ]
}

export async function ModerationSection() {
  let stats: ModerationStats

  try {
    stats = await getModerationStats()
  } catch (error) {
    console.error("[admin-dashboard] failed to load moderation stats", error)
    return <DashboardSectionError title="Couldn't load moderation status." />
  }

  const items = buildItems(stats)
  const needsAttention = stats.pendingNotes + stats.openReports > 0

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Moderation
        </h2>
        <p className="text-sm text-muted-foreground">
          Keep the public notes library useful, accurate, and safe.
        </p>
      </div>

      {needsAttention ? (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950">
          <p className="text-amber-800 dark:text-amber-300">
            {stats.pendingNotes}{" "}
            {stats.pendingNotes === 1 ? "note is" : "notes are"} waiting for
            review
          </p>
          <Button
            variant="link"
            size="sm"
            nativeButton={false}
            className="h-auto justify-start p-0 text-amber-800 dark:text-amber-300"
            render={
              <Link href="/admin/notes?status=PENDING_REVIEW" className="gap-1">
                Review pending notes
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={14}
                  color="currentColor"
                  strokeWidth={2}
                  className="size-3.5"
                />
              </Link>
            }
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
            className="size-4"
          />
          Everything is up to date.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HugeiconsIcon
                icon={item.icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {item.count}
            </p>
            <p className="text-xs text-muted-foreground">{item.description}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              nativeButton={false}
              render={<Link href={item.href as Route}>{item.cta}</Link>}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
