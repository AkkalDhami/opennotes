import { cn } from "@/lib/utils"
import React from "react"

export function SubHeading({
  children,
  as = "p",
  className,
}: {
  children: React.ReactNode
  as?: "h3" | "p"
  className?: string
}) {
  const Tag = as
  return (
    <Tag
      className={cn(
        "max-w-3xl font-heading text-base text-muted-foreground sm:text-lg",
        as === "h3" && "font-medium text-lg text-foreground sm:text-xl",
        className
      )}
    >
      {children}
    </Tag>
  )
}
