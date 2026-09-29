"use client"

import { motion, type Variants } from "motion/react"
import { RankMedal, type Rank } from "./rank-medal"
import { Separator } from "@/components/ui/separator"

interface RankCardProps {
  rank: Rank
  totalScore: number
  scoreUnit?: string
  medalSize?: number
  delay?: number
  className?: string
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 240, damping: 22 },
  },
}

const statVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut", delay },
  }),
}

export function RankCard({
  rank,
  totalScore,
  scoreUnit = "",
  medalSize,
  delay = 0,
  className = "",
}: RankCardProps) {
  const rankLabelDelay = delay + 0.35
  const scoreLabelDelay = delay + 0.45

  return (
    <motion.div
      custom={delay}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={[
        "relative flex items-center gap-6 overflow-hidden rounded-xl p-6",
        // "bg-linear-to-br from-emerald-50/70 via-white to-white",
        // "shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.10)]",
        // "ring-1 ring-black/4",
        "bg-primary/10",
        className,
      ].join(" ")}
    >
      <RankMedal rank={rank} size={medalSize} delay={delay} />

      <div className="flex flex-1 flex-col justify-center gap-3">
        <div className="flex flex-col gap-1">
          <motion.span
            custom={rankLabelDelay}
            variants={statVariants}
            initial="hidden"
            animate="visible"
            className="text-xs font-medium tracking-[0.14em] text-muted-foreground"
          >
            RANK
          </motion.span>
          <motion.span
            custom={rankLabelDelay}
            variants={statVariants}
            initial="hidden"
            animate="visible"
            className="text-3xl leading-none font-semibold"
          >
            #{rank}
          </motion.span>
        </div>

        <Separator />

        <div className="flex flex-col gap-1">
          <motion.span
            custom={scoreLabelDelay}
            variants={statVariants}
            initial="hidden"
            animate="visible"
            className="text-sm text-muted-foreground"
          >
            Total Score
          </motion.span>
          <motion.span
            custom={scoreLabelDelay}
            variants={statVariants}
            initial="hidden"
            animate="visible"
            className="text-2xl leading-none font-semibold"
          >
            {totalScore.toLocaleString()} {scoreUnit}
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}
