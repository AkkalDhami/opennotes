"use client"

import { getInitials } from "@/utils/get-initials"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkBadge01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export function VerifiedUserAvatar({
  displayName,
  avatarUrl,
  className,
  size = "sm",
}: {
  avatarUrl?: string | null
  displayName: string
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  return (
    <div className={cn("relative", className)}>
      <Avatar
        className={cn(
          "size-18 border",
          size === "sm" && "size-12",
          size === "md" && "size-16",
          size === "lg" && "size-20"
        )}
      >
        <AvatarImage
          src={avatarUrl ?? undefined}
          alt={`${displayName}'s avatar`}
        />
        <AvatarFallback className="text-lg">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <HugeiconsIcon
        icon={CheckmarkBadge01Icon}
        size={24}
        color="currentColor"
        strokeWidth={2}
        className={cn(
          "size-5 fill-blue-600 stroke-blue-600 text-white",
          "absolute -right-0.5 bottom-0.5 flex items-center justify-center rounded-full bg-background",
          size === "sm" && "size-3",
          size === "md" && "size-4",
          size === "lg" && "size-5"
        )}
      />
    </div>
  )
}
