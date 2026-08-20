import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react"
import {
  UserAdd01Icon,
  FileUploadIcon,
  CheckmarkBadge01Icon,
  CancelCircleIcon,
  Delete02Icon,
  Flag02Icon,
} from "@hugeicons/core-free-icons"

import { DashboardSectionError } from "./dashboard-section-error"
import {
  ActivityEvent,
  getRecentActivity,
} from "@/lib/admin/dashboard/get-recent-activity"
import { formatRelativeTime } from "@/lib/admin/dashboard/format-relative-time"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const EVENT_META: Record<
  ActivityEvent["type"],
  { icon: IconSvgElement; render: (event: ActivityEvent) => string }
> = {
  USER_JOINED: {
    icon: UserAdd01Icon,
    render: (e) =>
      `${(e as Extract<ActivityEvent, { type: "USER_JOINED" }>).actor} joined the platform`,
  },
  NOTE_SUBMITTED: {
    icon: FileUploadIcon,
    render: (e) => {
      const event = e as Extract<ActivityEvent, { type: "NOTE_SUBMITTED" }>
      return `${event.actor} submitted "${event.noteTitle}"`
    },
  },
  NOTE_PUBLISHED: {
    icon: CheckmarkBadge01Icon,
    render: (e) => {
      const event = e as Extract<ActivityEvent, { type: "NOTE_PUBLISHED" }>
      return `${event.actor} published "${event.noteTitle}"`
    },
  },
  NOTE_REJECTED: {
    icon: CancelCircleIcon,
    render: (e) => {
      const event = e as Extract<ActivityEvent, { type: "NOTE_REJECTED" }>
      return `"${event.noteTitle}" was rejected`
    },
  },
  NOTE_REMOVED: {
    icon: Delete02Icon,
    render: (e) => {
      const event = e as Extract<ActivityEvent, { type: "NOTE_REMOVED" }>
      return `"${event.noteTitle}" was removed`
    },
  },
  REPORT_SUBMITTED: {
    icon: Flag02Icon,
    render: (e) => {
      const event = e as Extract<ActivityEvent, { type: "REPORT_SUBMITTED" }>
      return `A report was submitted for "${event.noteTitle}"`
    },
  },
}

const COLORS: Record<ActivityEvent["type"], string> = {
  USER_JOINED: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  NOTE_SUBMITTED: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  NOTE_PUBLISHED: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  NOTE_REJECTED: "text-red-500 bg-red-500/10 border-red-500/20",
  NOTE_REMOVED: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
  REPORT_SUBMITTED: "text-orange-500 bg-orange-500/10 border-orange-500/20",
}

export async function RecentActivitySection() {
  let activity: ActivityEvent[]

  try {
    activity = await getRecentActivity(8)
  } catch (error) {
    console.error("[admin-dashboard] failed to load recent activity", error)
    return <DashboardSectionError title="Couldn't load recent activity." />
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h3 className="text-lg font-medium">Recent Activity</h3>
      {activity.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No platform activity yet.
        </p>
      ) : (
        <ScrollArea className={"h-80 scroll-fade scroll-auto"}>
          <ul className="space-y-4">
            {activity.map((event) => {
              const meta = EVENT_META[event.type]
              return (
                <li key={event.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border",
                      COLORS[event.type]
                    )}
                  >
                    <HugeiconsIcon
                      icon={meta.icon}
                      size={14}
                      color="currentColor"
                      strokeWidth={2}
                      className="size-3.5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {meta.render(event)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(event.timestamp)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </ScrollArea>
      )}
    </div>
  )
}
