import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { NoteStatus } from "@/db"

const STATUS_CONFIG: Record<NoteStatus, { label: string; className: string }> =
  {
    DRAFT: {
      label: "Draft",
      className: "bg-muted text-muted-foreground border-border",
    },
    PENDING_REVIEW: {
      label: "Pending review",
      className:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
    },
    PUBLISHED: {
      label: "Published",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900",
    },
    REJECTED: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
    },
    REMOVED: {
      label: "Removed",
      className:
        "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
    },
  }

// Status is communicated via text label first — the colored dot is a
// supplementary cue, never the only signal (colorblind-safe by design).
export function NoteStatusBadge({ status }: { status: NoteStatus }) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-normal", config.className)}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {config.label}
    </Badge>
  )
}
