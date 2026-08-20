import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon } from "@hugeicons/core-free-icons"
import { formatExactNumber } from "@/utils/format"
import { AdminNoteStats } from "@/types/note"

interface AdminNotesStatsProps {
  stats: AdminNoteStats
}

export function AdminNotesStats({ stats }: AdminNotesStatsProps) {
  const cards = [
    {
      label: "Total notes",
      value: stats.totalNotes,
      helper:
        stats.totalNotesDeltaThisMonth > 0
          ? `+${formatExactNumber(stats.totalNotesDeltaThisMonth)} this month`
          : undefined,
    },
    { label: "Published", value: stats.published },
    {
      label: "Pending review",
      value: stats.pendingReview,
      helper: stats.pendingReview > 0 ? "Needs attention" : undefined,
      helperIcon: stats.pendingReview > 0,
    },
    { label: "Removed", value: stats.removed },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-card p-4"
        >
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {formatExactNumber(card.value)}
          </p>
          {card.helper && (
            <p
              className={
                card.helperIcon
                  ? "mt-1 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-500"
                  : "mt-1 text-xs text-muted-foreground"
              }
            >
              {card.helperIcon && (
                <HugeiconsIcon
                  icon={Alert02Icon}
                  size={12}
                  color="currentColor"
                  strokeWidth={2}
                  className="size-3"
                />
              )}
              {card.helper}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
