"use client"

import Link from "next/link"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import {
  GoldMedal,
  SilverMedal,
  BronzeMedal,
  RankMedal,
  type Rank,
} from "@/components/shared/rank-medal"
import { cn } from "@/lib/utils"

const REMAINING_RANKS: Rank[] = [4, 5, 6, 7, 8, 9, 10]

export function ContributorMedalShowcase({
  className,
}: {
  className?: string
}) {
  return (
    <section
      className={cn(
        "flex w-full flex-col items-center gap-12 text-center",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex max-w-xl flex-col items-center gap-3"
      >
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Become a Contributor
        </h2>
        <p className="text-muted-foreground">
          Every note you share helps someone else learn faster. Publish your
          notes, climb the leaderboard, and earn your place among our top
          contributors.
        </p>
      </motion.div>

      <Link
        href="/contribution"
        aria-label="Go to the contribution page and start sharing notes"
        className="group flex flex-col items-center gap-12 rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      >
        <div className="flex items-end justify-center gap-10 transition-transform duration-300 group-hover:-translate-y-1">
          <SilverMedal delay={0.1} showLabel={false} />
          <div className="mb-6">
            <GoldMedal size={216} delay={0} showLabel={false} />
          </div>
          <BronzeMedal delay={0.2} showLabel={false} />
        </div>

        <div className="flex flex-wrap items-start justify-center gap-6">
          {REMAINING_RANKS.map((rank, i) => (
            <RankMedal
              key={rank}
              rank={rank}
              showLabel={false}
              delay={0.3 + i * 0.06}
            />
          ))}
        </div>
      </Link>

      <Button
        variant={"brand"}
        nativeButton={false}
        render={<Link href="/contribution">Share Your Notes</Link>}
        size="lg"
        className="rounded-full px-8 py-6"
      ></Button>
    </section>
  )
}
