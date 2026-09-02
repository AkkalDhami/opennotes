"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

import type { NavigationItem } from "./nav-main"
import { Route } from "next"
import { isActiveLink } from "@/utils/check-active-link"
import { HugeiconsIcon } from "@hugeicons/react"

export function MobileNav({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 sm:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 px-2">
        {items.map(({ title, url, icon: Icon }) => {
          const isActive = isActiveLink(pathname, url)

          return (
            <Link
              key={url}
              href={url as Route}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-xs transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {Icon && (
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-lg transition-colors"
                  )}
                >
                  <HugeiconsIcon
                    icon={Icon}
                    size={20}
                    color="currentColor"
                    strokeWidth={2}
                  />
                </span>
              )}

              <span className="max-w-full truncate leading-none">{title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
