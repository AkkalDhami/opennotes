import { Badge } from "@/components/ui/badge"
import { NoteStatus } from "@/db"
import { cn } from "@/lib/utils"
import { STATUS_CONFIG } from "@/types/contribution"

interface StatusBadgeProps {
  status: NoteStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-medium",
        config.badgeClassName,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
