"use client"

import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "motion/react"

import { Button } from "@/components/ui/button"
import { ContributorCard } from "@/components/contributors/contributor-card"
import type { Contributor } from "@/types/contributor"
import { Reveal } from "../shared/reveal"
import { SectionHeader } from "../shared/section-header"
import { SubHeading } from "../ui/sub-heading";
import { Heading } from "../ui/heading";

interface ContributorsSectionContentProps {
  contributors: Contributor[]
}

export function ContributorsSectionContent({
  contributors,
}: ContributorsSectionContentProps) {
  const shouldReduceMotion = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  }

  const item: Variants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.2 : 0.5, ease: "easeOut" },
    },
  }

  if (contributors.length === 0) {
    return (
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={container}
        className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center"
      >
        <motion.div variants={item} className="space-y-1.5">
          <h2
            id="contributors-heading"
            className="font-medium text-card-foreground"
          >
            No contributors yet.
          </h2>
          <p className="text-sm text-muted-foreground">
            Be one of the first people to share knowledge with the community.
          </p>
        </motion.div>
        <motion.div variants={item}>
          <Button
            render={<Link href="/upload">Share Your Notes</Link>}
          ></Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      <Reveal>
        <SectionHeader
          headingId="popular-subjects-heading"
          title="Meet the contributors"
          description="Students and teachers sharing knowledge to help others learn."
          viewAllHref="/contributors"
          viewAllLabel="View all contributors"
        />
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {contributors.map((contributor) => (
          <motion.div key={contributor.id} variants={item}>
            <ContributorCard contributor={contributor} className="h-full" />
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={item}
        className="mt-14 flex flex-col items-center gap-3 rounded-lg bg-card px-6 py-10 text-center"
      >
        <Heading className="">Your notes can help someone learn.</Heading>
        <SubHeading className="">
          Share what you&apos;ve learned and make useful study resources
          accessible to everyone.
        </SubHeading>
        <Button
          variant="brand"
          render={<Link href="/upload">Share Your Notes</Link>}
          className="mt-2 px-4 py-4"
        ></Button>
      </motion.div>
    </motion.div>
  )
}
