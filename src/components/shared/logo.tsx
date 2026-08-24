"use client"

import { APP_NAME } from "@/constants/app.constants"
import { cn } from "@/lib/utils"
import { BookOpen01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("relative flex items-center gap-2 font-medium", className)}
    >
      <HugeiconsIcon
        icon={BookOpen01Icon}
        size={24}
        color="currentColor"
        strokeWidth={2}
        className="size-8 rounded-lg bg-primary px-2 py-1.5 text-primary-foreground"
      />
      <span className="text-[22px]">{APP_NAME}</span>
    </Link>
  )
}
