import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { NoteStatus } from "@/db/schemas/note.schema"

const STATUS_CONFIG: Record<
  NoteStatus,
  { label: string; className: string }
> = {
  PENDING_REVIEW: {
    label: "Pending Review",
    className:
      "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  PUBLISHED: {
    label: "Published",
    className:
      "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  REJECTED: {
    label: "Rejected",
    className: "border-transparent bg-destructive/15 text-destructive",
  },
  REMOVED: {
    label: "Removed",
    className: "border-transparent bg-muted text-muted-foreground",
  },
  DRAFT: {
    label: "Draft",
    className: "text-foreground",
  },
}



export function ContributionStatusBadge({ status }: { status: NoteStatus }) {
  const config = STATUS_CONFIG[status]
  const variant = status === "DRAFT" ? "outline" : undefined

  return (
    <Badge variant={variant} className={cn(config.className)}>
      {config.label}
    </Badge>
  )
}
