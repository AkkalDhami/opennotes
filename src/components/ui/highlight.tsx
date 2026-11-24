"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type HighlightProps = React.ComponentProps<"span"> & {
  /** "solid" = tinted fill (dark-mode look), "hatch" = diagonal stripes (light-mode look) */
  variant?: "solid" | "hatch" | "outline"
  /** Corner handle shape */
  handle?: "square" | "rounded"
  /** Any CSS color. Drives border, fill, stripes and handle outline. */
  color?: string
  /** Smaller handles and tighter padding, for body-size text */
  compact?: boolean
  /** Animate in when scrolled into view. Set false to render statically. */
  animate?: boolean
  /** Seconds before the animation starts */
  delay?: number
}

const corners = [
  "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
  "top-0 right-0 translate-x-1/2 -translate-y-1/2",
  "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
  "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
] as const

export function Highlight({
  variant = "solid",
  handle = "square",
  color = "var(--primary)",
  compact = false,
  animate = true,
  delay = 0,
  className,
  style,
  children,
  ...props
}: HighlightProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" })
  const reduce = useReducedMotion()

  const shouldAnimate = animate && !reduce
  const show = !shouldAnimate || inView

  return (
    <span
      ref={ref}
      data-slot="highlight"
      data-variant={variant}
      className={cn(
        "relative isolate mx-[0.08em] inline-block",
        compact ? "px-[0.3em]" : "px-[0.18em]",
        className
      )}
      style={{ "--hl": color, ...style } as React.CSSProperties}
      {...props}
    >
      {/* Box: border + fill, revealed left to right */}
      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 border-2 border-(--hl)",
          variant === "solid" &&
            "bg-[color-mix(in_oklab,var(--hl)_15%,transparent)]",
          variant === "outline" &&
            "bg-[repeating-linear-gradient(135deg,currentColor_0_1px,transparent_1px_4px)] text-[color-mix(in_oklab,var(--hl)_15%,transparent)] dark:border-[color-mix(in_oklab,var(--hl)_75%,transparent)] dark:bg-[color-mix(in_oklab,var(--hl)_6%,transparent)] dark:text-[color-mix(in_oklab,var(--hl)_20%,transparent)]",
          variant === "hatch" &&
            "border-[color-mix(in_oklab,var(--hl)_70%,transparent)] bg-[repeating-linear-gradient(135deg,color-mix(in_oklab,var(--hl)_100%,transparent)_0_2px,transparent_2px_7px),color-mix(in_oklab,var(--hl)_56%,transparent)]"
        )}
        initial={shouldAnimate ? { clipPath: "inset(0 100% 0 0)" } : false}
        animate={{ clipPath: show ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      />

      {corners.map((position, i) => (
        <motion.span
          key={position}
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-30 border-2 border-(--hl) bg-(--np-background)",
            compact ? "size-1.75" : "size-2",
            handle === "rounded" && "shrink-0 rounded-full",
            position
          )}
          initial={shouldAnimate ? { scale: 0 } : false}
          animate={{ scale: show ? 1 : 0 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 24,
            delay: delay + 0.35 + i * 0.06,
          }}
        />
      ))}

      {children}
    </span>
  )
}
