"use client"

import { useState } from "react"
import { links } from "./navbar"
import Link from "next/link"
import { Route } from "next"
import { isActiveLink } from "@/utils/check-active-link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

export function NavLinks() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-6 rounded-full border bg-background px-4 py-3 font-medium backdrop-blur md:flex">
      {links.map((l, i) => {
        const isActive = isActiveLink(pathname, l.href)
        const isMoving = (hoveredIndex ?? (isActive ? i : -1)) === i
        return (
          <Link
            key={l.href}
            href={l.href as Route}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}

            className={cn(
              "relative cursor-pointer px-3 py-1.5 text-xs font-medium tracking-widest uppercase transition-all duration-300",
              isMoving
                ? "text-accent"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <span className="relative z-10">{l.label}</span>
            {isMoving && (
              <motion.div
                layoutId="nav-active"
                initial={false}
                className="group absolute inset-0 rounded-full bg-foreground"
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
