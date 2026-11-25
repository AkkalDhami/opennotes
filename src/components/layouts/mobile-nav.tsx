"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

import type { NavigationItem } from "./nav-main"
import { Route } from "next"
import { isActiveLink } from "@/utils/check-active-link"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

const VISIBLE_ITEM_COUNT = 4

export function MobileNav({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const visibleItems = items.slice(0, VISIBLE_ITEM_COUNT)
  const moreItems = items.slice(VISIBLE_ITEM_COUNT)
  const moreIsActive = moreItems.some((item) =>
    isActiveLink(pathname, item.url)
  )

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 sm:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 px-2">
        {visibleItems.map(({ title, url, icon: Icon }) => {
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
                <span className="flex size-6 items-center justify-center rounded-lg transition-colors">
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

        {moreItems.length > 0 && (
          <Drawer open={moreOpen} onOpenChange={setMoreOpen} showSwipeHandle>
            <DrawerTrigger
              render={
                <button
                  type="button"
                  aria-label="More navigation links"
                  aria-expanded={moreOpen}
                  className={cn(
                    "relative flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-md px-1 text-xs transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    moreIsActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex size-6 items-center justify-center rounded-lg transition-colors">
                    <HugeiconsIcon
                      icon={MoreHorizontalIcon}
                      size={20}
                      color="currentColor"
                      strokeWidth={2}
                    />
                  </span>
                  <span className="max-w-full truncate leading-none">More</span>
                </button>
              }
            />

            <DrawerContent className="pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              <DrawerHeader>
                <DrawerTitle>More navigation</DrawerTitle>
                <DrawerDescription>
                  Open more pages from your profile.
                </DrawerDescription>
              </DrawerHeader>

              <nav
                aria-label="More navigation links"
                className="grid gap-1 overflow-y-auto p-4 pt-2"
              >
                {moreItems.map(({ title, url, icon: Icon }) => {
                  const isActive = isActiveLink(pathname, url)

                  return (
                    <Link
                      key={url}
                      href={url as Route}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {Icon && (
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                          <HugeiconsIcon
                            icon={Icon}
                            size={17}
                            color="currentColor"
                            strokeWidth={2}
                          />
                        </span>
                      )}
                      <span className="font-medium">{title}</span>
                    </Link>
                  )
                })}
              </nav>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </nav>
  )
}
