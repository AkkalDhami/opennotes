"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { getTierPresentation } from "@/lib/contributors/tier-presentation"

interface TierChipProps {
  tier: number
  label: string
  size?: "sm" | "lg"
  className?: string
}

/**
 * Renders a tier as a rotated ledger stamp — the signature visual motif for
 * the contributor system. Deliberately the one ornamental element on the
 * page; everything else around it stays quiet ruled-paper styling.
 */
export function TierChip({
  tier,
  label,
  size = "sm",
  className,
}: TierChipProps) {
  const { icon, accent, soft } = getTierPresentation(tier)
  const isLarge = size === "lg"

  return (
    <motion.div
      initial={{ opacity: 0, rotate: -8, scale: 0.9 }}
      animate={{ opacity: 1, rotate: -4, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[3px] border-2 font-mono tracking-widest uppercase select-none",
        "border-current",
        accent,
        soft,
        isLarge ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-[10px]",
        className
      )}
      style={{
        boxShadow: "1px 1px 0 currentColor",
      }}
    >
      <HugeiconsIcon
        icon={icon}
        size={isLarge ? 18 : 12}
        color="currentColor"
        strokeWidth={2}
      />
      {label}
    </motion.div>
  )
}
