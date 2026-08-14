"use client"

import { motion, useReducedMotion, Variants } from "motion/react"
import { ReactNode } from "react"

const EASE = [0.22, 1, 0.36, 1] as const

interface RevealProps {
  children: ReactNode
  className?: string
}

/**
 * Fades + lifts a single element in as it enters the viewport.
 * Used for section headings.
 */
export function Reveal({ children, className }: RevealProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerGroupProps {
  children: ReactNode
  className?: string
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
}

/**
 * Wraps a grid/list of cards; each direct child staggers in on viewport
 * entry. Pass items wrapped individually — see usage in
 * `popular-subjects.tsx` / `trending-notes.tsx`.
 */
export function StaggerGroup({ children, className }: StaggerGroupProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: StaggerGroupProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}
