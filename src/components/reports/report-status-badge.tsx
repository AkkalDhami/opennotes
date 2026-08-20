import { Badge } from "@/components/ui/badge"
import { ReportType } from "@/db"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<
  ReportType["status"],
  { label: string; className: string }
> = {
  OPEN: {
    label: "Open",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
  },
  RESOLVED: {
    label: "Resolved",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900",
  },
  DISMISSED: {
    label: "Dismissed",
    className:
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
  },
}

export function ReportStatusBadge({
  status,
}: {
  status: ReportType["status"]
}) {
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
