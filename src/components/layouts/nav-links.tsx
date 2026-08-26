"use client"

import Link from "next/link"
import { Route } from "next"
import { NAV_LINKS } from "@/constants/nav.constants"
import { isActiveLink } from "@/utils/check-active-link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import { useState } from "react"

export function NavLinks() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const pathname = usePathname()

  return (
    <nav
      onMouseLeave={() => setHoveredIndex(null)}
      className="hidden items-center gap-6 rounded-full border bg-background px-3 py-2 font-medium backdrop-blur md:flex"
    >
      {NAV_LINKS.map((l, i) => {
        const isActive = isActiveLink(pathname, l.href)

        // Hover takes priority, otherwise show active route
        const isMoving = hoveredIndex !== null ? hoveredIndex === i : isActive

        return (
          <Link
            key={l.href}
            href={l.href as Route}
            onMouseEnter={() => setHoveredIndex(i)}
            className={cn(
              "relative cursor-pointer px-3 py-1.5 text-sm font-medium transition-all duration-300",
              isMoving
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <span className="relative z-10">{l.label}</span>

            {isMoving && (
              <motion.div
                layoutId="nav-active"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{
                  type: "spring",
                  bounce: 0.25,
                  duration: 0.5,
                }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
