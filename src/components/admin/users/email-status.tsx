import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Alert02Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

interface EmailStatusProps {
  verified: boolean
  className?: string
}

export function EmailStatus({ verified, className }: EmailStatusProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium",
        verified ? "text-green-500" : "text-muted-foreground",
        className
      )}
    >
      <HugeiconsIcon
        icon={verified ? CheckmarkCircle02Icon : Alert02Icon}
        size={16}
        strokeWidth={2}
        className={verified ? "text-green-500" : "text-muted-foreground"}
        aria-hidden="true"
      />
      {verified ? "Verified" : "Unverified"}
    </span>
  )
}
