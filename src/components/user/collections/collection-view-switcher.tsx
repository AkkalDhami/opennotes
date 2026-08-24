"use client"

import { GridViewIcon, ListViewIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Route } from "next"

export type CollectionView = "grid" | "list"

interface CollectionViewSwitcherProps {
  value: CollectionView
  className?: string
}

export function CollectionViewSwitcher({
  value,
  className,
}: CollectionViewSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function changeView(nextView: CollectionView) {
    const params = new URLSearchParams(searchParams.toString())

    params.set("view", nextView)

    router.push(`${pathname}?${params.toString()}` as Route, {
      scroll: false,
    })
  }

  return (
    <div
      role="group"
      aria-label="Collection view"
      className={cn(
        "inline-flex items-center rounded-lg border bg-muted/40 p-1",
        className
      )}
    >
      <Button
        type="button"
        variant={value === "grid" ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label="Grid view"
        aria-pressed={value === "grid"}
        onClick={() => changeView("grid")}
        className="size-8"
      >
        <HugeiconsIcon
          icon={GridViewIcon}
          size={18}
          color="currentColor"
          strokeWidth={2}
        />
      </Button>

      <Button
        type="button"
        variant={value === "list" ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label="List view"
        aria-pressed={value === "list"}
        onClick={() => changeView("list")}
        className="size-8"
      >
        <HugeiconsIcon
          icon={ListViewIcon}
          size={18}
          color="currentColor"
          strokeWidth={2}
        />
      </Button>
    </div>
  )
}
