"use client"

import Link from "next/link"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import {
  GoldMedal,
  SilverMedal,
  BronzeMedal,
} from "@/components/shared/rank-medal"
import { cn } from "@/lib/utils"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { NoiseTexture } from "@/components/ui/noise-texture"

export function ContributorMedalShowcase({
  className,
  minimal = false,
}: {
  className?: string
  minimal?: boolean
}) {
  if (minimal) {
    return (
      <section
        className={cn(
          "relative flex flex-col gap-8 overflow-hidden rounded-xl bg-primary p-10 text-primary-foreground sm:p-18",
          className
        )}
      >
        <div className="absolute inset-0 hidden h-full w-full overflow-hidden md:block">
          <div className="absolute top-1/2 right-[-45%] aspect-square h-200 w-200 -translate-y-1/2">
            <div className="absolute inset-0 rounded-full bg-primary opacity-30"></div>
            <div className="absolute inset-0 scale-[0.8] rounded-full bg-primary opacity-30"></div>
            <div className="absolute inset-0 scale-[0.6] rounded-full bg-primary opacity-30"></div>
            <div className="absolute inset-0 scale-[0.4] rounded-full bg-primary opacity-30"></div>
            <div className="absolute inset-0 scale-[0.2] rounded-full bg-primary opacity-80"></div>
            <div className="absolute inset-0 scale-[0.1] rounded-full bg-white/50 opacity-30"></div>
          </div>
        </div>

        <NoiseTexture noiseOpacity={0.3} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative flex max-w-xl flex-col gap-6"
        >
          <Heading className="font-semibold">Become a Contributor</Heading>
          <SubHeading className="font-medium text-primary-foreground">
            Every note you share helps someone else learn faster. Publish your
            notes, climb the leaderboard, and earn your place among our top
            contributors.
          </SubHeading>
        </motion.div>

        <Button
          nativeButton={false}
          variant="default"
          render={
            <Link href="/contribution">
              <div className="absolute right-[calc(100%-44px)] left-1 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-500 group-hover:left-[calc(100%-44px)] group-hover:-rotate-45">
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={24}
                  color="currentColor"
                  strokeWidth={2}
                />
              </div>

              <span className="absolute left-14 font-medium whitespace-nowrap transition-all duration-500 group-hover:left-4">
                Share Your Notes
              </span>
            </Link>
          }
          className="group relative h-12 w-48 overflow-hidden rounded-full bg-background p-1 ps-14 pe-4 text-sm font-medium text-foreground transition-all duration-500 group-hover:ps-0 group-hover:pe-14 hover:bg-background/10"
        ></Button>
      </section>
    )
  }
  return (
    <section
      className={cn(
        "relative flex flex-col items-center gap-12 overflow-hidden rounded-xl p-10 text-center",
        className
      )}
    >
      <NoiseTexture noiseOpacity={0.3} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex max-w-xl flex-col items-center gap-3"
      >
        <Heading>Become a Contributor</Heading>
        <SubHeading>
          Every note you share helps someone else learn faster. Publish your
          notes, climb the leaderboard, and earn your place among our top
          contributors.
        </SubHeading>
      </motion.div>

      <Link
        href="/contribution"
        aria-label="Go to the contribution page and start sharing notes"
        className="group flex flex-col items-center gap-12 rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      >
        <div className="flex items-end justify-center gap-10 transition-transform duration-300 group-hover:-translate-y-1">
          <SilverMedal delay={0.1} size={120} showLabel={false} />
          <div className="mb-6">
            <GoldMedal size={150} delay={0} showLabel={false} />
          </div>
          <BronzeMedal delay={0.2} size={120} showLabel={false} />
        </div>

        {/* <div className="flex flex-wrap items-start justify-center gap-6">
          {REMAINING_RANKS.map((rank, i) => (
            <RankMedal
              key={rank}
              rank={rank}
              showLabel={false}
              delay={0.3 + i * 0.06}
            />
          ))}
        </div> */}
      </Link>

      <Button
        nativeButton={false}
        variant="default"
        render={
          <Link href="/contribution">
            <div className="absolute right-[calc(100%-44px)] left-1 flex size-10 items-center justify-center rounded-full bg-accent text-foreground transition-all duration-500 group-hover:left-[calc(100%-44px)] group-hover:-rotate-45">
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={24}
                color="currentColor"
                strokeWidth={2}
              />
            </div>

            <span className="absolute left-14 whitespace-nowrap transition-all duration-500 group-hover:left-4">
              Share Your Notes
            </span>
          </Link>
        }
        className="group relative h-12 w-48 overflow-hidden rounded-full p-1 ps-14 pe-4 text-sm font-medium transition-all duration-500 group-hover:ps-0 group-hover:pe-14"
      ></Button>
    </section>
  )
}
