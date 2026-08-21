import { cn } from "@/lib/utils"
import React from "react"

export function DashboardContainer({
  children,
  className,
  ...props
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(`space-y-6`, className)} {...props}>
      {children}
    </div>
  )
}
