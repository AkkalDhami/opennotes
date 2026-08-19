"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import { Suspense } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { BookOpen02Icon, Share05Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { HeroSearch } from "@/components/search/hero-search"
import { Section } from "@/components/ui/section"
import { buttonVariants } from "@/components/ui/button"
import { LiquidEther } from "@/components/ui/liquid-ether"
import { SideRays } from "@/components/ui/siderays"
import Link from "next/link"
import { Route } from "next"

interface HeroSectionProps {
  className?: string
}

const STAGGER_STEP = 0.08

export function HeroSection({ className }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : STAGGER_STEP,
        delayChildren: 0,
      },
    },
  }

  const item: Variants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.15 : 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-0 hidden h-screen dark:block">
        <LiquidEther
          colors={["#080e07", "#fcfaed", "#080e07"]}
          mouseForce={20}
          cursorSize={100}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 hidden h-screen dark:hidden">
        <SideRays
          rayColor1="#f6f1df"
          rayColor2="#080e07"
          origin="top-right"
          speed={4.5}
          intensity={2}
          spread={2}
          tilt={0}
          saturation={3.5}
          blend={0.75}
          falloff={1.6}
          opacity={1}
        />
      </div>
      <Section
        id="hero"
        className={cn(
          "relative isolate mb-12 overflow-hidden px-6 py-16 sm:py-18 lg:py-22",
          className
        )}
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="relative mx-auto flex max-w-4xl flex-col items-center space-y-6 text-center"
        >
          <motion.p
            variants={item}
            className="font-heading text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase sm:text-sm"
          >
            BUILT BY LEARNERS, SHARED WITH EVERYONE
          </motion.p>

          <motion.h1
            variants={item}
            className="text-5xl leading-[1.08] font-medium tracking-tight sm:text-6xl lg:text-7xl"
          >
            Share what you know. <br /> Find what you need.
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto max-w-150 text-base leading-relaxed text-muted-foreground sm:max-w-170 sm:text-lg"
          >
            Discover notes and study materials shared by students and educators.
            Upload your own notes, build your contributor profile, and help
            others learn.
          </motion.p>

          <motion.div variants={item} className="w-full max-w-2xl">
            <Suspense fallback={<div className="h-14" />}>
              <HeroSearch placeholder="Search notes, subjects, topics, courses, and contributors" />
            </Suspense>
          </motion.div>

          <motion.div
            variants={item}
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4"
          >
            <Link
              href={"/notes" as Route}
              className={cn(
                buttonVariants({
                  variant: "default",
                }),
                "rounded-lg px-4 py-5.5 text-base font-normal"
              )}
            >
              <HugeiconsIcon
                icon={BookOpen02Icon}
                size={18}
                aria-hidden="true"
              />
              Browse Notes
            </Link>
            <Link
              href="/contribution"

              className={cn(
                buttonVariants({
                  variant: "outline",
                }),
                "rounded-lg px-4 py-5.5 text-base font-normal"
              )}
            >
              <HugeiconsIcon icon={Share05Icon} size={18} aria-hidden="true" />
              Share Your Notes
            </Link>
          </motion.div>

          <motion.p variants={item} className="text-sm text-muted-foreground">
            No private groups. No USB drives. Just share the link.
          </motion.p>
        </motion.div>
      </Section>
    </>
  )
}
