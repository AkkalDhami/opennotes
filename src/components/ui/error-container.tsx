import { cn } from "@/lib/utils"
import React from "react"

export function ErrorContainer({
  children,
  className,
  ...props
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        `flex h-full w-full flex-col items-center justify-center space-y-4`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
