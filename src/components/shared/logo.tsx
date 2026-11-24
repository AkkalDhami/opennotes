"use client"

import { cn } from "@/lib/utils"
import { BookOpen01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"
import Link from "next/link"
import { useState } from "react"
import { Highlight } from "@/components/ui/highlight"

type Word = "open" | "notes"

const words: { id: Word; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "notes", label: "Notes" },
]

export function Logo({ className }: { className?: string }) {
  const [active, setActive] = useState<Word>("notes")

  return (
    <Link
      href="/"
      className={cn(
        "relative isolate flex items-center gap-2 font-[550]",
        className
      )}
      onMouseLeave={() => setActive("notes")}
      onBlur={() => setActive("notes")}
    >
      <HugeiconsIcon
        icon={BookOpen01Icon}
        size={24}
        color="currentColor"
        strokeWidth={2}
        className="size-8 rounded-lg bg-primary px-2 py-1.5 text-primary-foreground"
      />

      <span className="flex text-[22px]">
        {words.map(({ id, label }) => (
          <span
            key={id}
            onMouseEnter={() => setActive(id)}
            onFocus={() => setActive(id)}
            className={cn(
              "relative px-0.5 transition-colors",
              id === "notes" && "text-foreground"
            )}
          >
            {active === id && (
              <motion.span
                layoutId="logo-highlight"
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -inset-x-0.5 inset-y-0 -z-10",
                  "*:absolute! *:inset-0! *:m-0! *:block! *:size-full! *:p-0!"
                )}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              >
                <Highlight compact animate={false} variant="hatch">
                  <span className="block size-full" />
                </Highlight>
              </motion.span>
            )}
            {label}
          </span>
        ))}
      </span>
    </Link>
  )
}
