import { HugeiconsIcon } from "@hugeicons/react"
import { ComputerIcon, SmartPhoneIcon } from "@hugeicons/core-free-icons"
import { PublicSessionType } from "@/types/session"
import { cn } from "@/lib/utils"

export function DeviceBadge({
  deviceType,
  className,
}: {
  deviceType: PublicSessionType["deviceType"]
  className?: string
}) {
  const icon =
    deviceType === "mobile" || deviceType === "tablet"
      ? SmartPhoneIcon
      : ComputerIcon

  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground",
        className
      )}
      aria-hidden="true"
    >
      <HugeiconsIcon icon={icon} size={18} strokeWidth={2} />
    </div>
  )
}
