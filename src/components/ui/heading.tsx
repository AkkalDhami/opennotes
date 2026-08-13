"use client"

import { cn } from "@/lib/utils"
import { HTMLMotionProps, motion } from "motion/react"
import React from "react"

type HeadingProps = {
  as?: "h1" | "h2"
  children: React.ReactNode
} & Omit<HTMLMotionProps<"h1">, "children">

export function Heading({
  children,
  as = "h2",
  className,
  ...props
}: HeadingProps) {
  const Tag = as === "h1" ? motion.h1 : motion.h2

  return (
    <Tag
      {...props}
      className={cn(
        "font-heading text-3xl font-semibold sm:text-4xl",
        as === "h2" && "text-2xl font-medium sm:text-3xl",
        className
      )}
    >
      {children}
    </Tag>
  )
}
