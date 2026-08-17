import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react"

import { cn } from "@/lib/utils"

type StatCardProps = {
  icon: IconSvgElement
  label: string
  value: string | number
  description: string
  tone?: "default" | "warning"
}

export function StatCard({
  icon,
  label,
  value,
  description,
  tone = "default",
}: StatCardProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-foreground",
          tone === "warning" &&
            "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400"
        )}
      >
        <HugeiconsIcon
          icon={icon}
          size={18}
          color="currentColor"
          strokeWidth={2}
          className="size-4.5"
        />
      </div>
    </div>
  )
}
