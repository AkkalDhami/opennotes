"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Award01Icon, Locker01Icon } from "@hugeicons/core-free-icons"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { BADGE_DEFINITIONS } from "@/lib/contributors/badge-definitions"
import { getBadgeIcon } from "@/lib/contributors/tier-presentation"

interface BadgeGridProps {
  earnedSlugs: string[]
  /** cap how many stubs show inline before "View all" is needed */
  previewCount?: number
}

function BadgeStub({
  name,
  description,
  earned,
  icon,
}: {
  name: string
  description: string
  earned: boolean
  icon: ReturnType<typeof getBadgeIcon>
}) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-2.5 rounded-md border px-3 py-2.5",
        "before:absolute before:top-1/2 before:-left-1.5 before:size-3 before:-translate-y-1/2 before:rounded-full before:border before:bg-background",
        "after:absolute after:top-1/2 after:-right-1.5 after:size-3 after:-translate-y-1/2 after:rounded-full after:border after:bg-background",
        earned
          ? "border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/30"
          : "border-dashed border-stone-300 bg-stone-50/60 opacity-60 dark:border-stone-700 dark:bg-stone-900/30"
      )}
      title={description}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border",
          earned
            ? "border-amber-400 text-amber-700 dark:text-amber-400"
            : "border-stone-300 text-stone-400"
        )}
      >
        <HugeiconsIcon
          icon={earned ? icon : Locker01Icon}
          size={14}
          color="currentColor"
          strokeWidth={2}
        />
      </span>
      <div className="min-w-0">
        <p className="truncate font-mono text-xs leading-tight font-medium">
          {name}
        </p>
        <p className="truncate text-[11px] leading-tight text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

export function BadgeGrid({ earnedSlugs, previewCount = 6 }: BadgeGridProps) {
  const earned = new Set(earnedSlugs)
  const preview = BADGE_DEFINITIONS.slice(0, previewCount)

  return (
    <div className="space-y-3">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.04 } },
        }}
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {preview.map((badge) => (
          <motion.div
            key={badge.slug}
            variants={{
              hidden: { opacity: 0, y: 6 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <BadgeStub
              name={badge.name}
              description={badge.description}
              earned={earned.has(badge.slug)}
              icon={getBadgeIcon(badge.slug, badge.tier)}
            />
          </motion.div>
        ))}
      </motion.div>

      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" size="sm" className="w-full gap-2">
              <HugeiconsIcon
                icon={Award01Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
              View all badges ({earned.size}/{BADGE_DEFINITIONS.length})
            </Button>
          }
        />
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle className="font-mono text-sm tracking-widest uppercase">
              Badge catalog
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2 overflow-y-auto px-4 pb-6">
            {BADGE_DEFINITIONS.map((badge) => (
              <BadgeStub
                key={badge.slug}
                name={badge.name}
                description={badge.description}
                earned={earned.has(badge.slug)}
                icon={getBadgeIcon(badge.slug, badge.tier)}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
