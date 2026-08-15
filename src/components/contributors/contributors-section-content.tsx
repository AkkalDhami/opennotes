"use client"

import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "motion/react"

import { Button } from "@/components/ui/button"
import { TopContributors } from "@/components/admin/contributors/top-contributors"
import { ContributorListItem } from "@/lib/admin/queries"

interface ContributorsSectionContentProps {
  contributors: ContributorListItem[]
  admin?: boolean
  home?: boolean
}

export function ContributorsSectionContent({
  contributors,
  admin = false,
  home = false,
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
            nativeButton={false}
            render={<Link href="/contribution">Share Your Notes</Link>}
          ></Button>
        </motion.div>
      </motion.div>
    )
  }

  return <TopContributors contributors={contributors} home={home} admin={admin} />
}
