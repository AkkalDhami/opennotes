"use client"

import { GridViewIcon, ListViewIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { NotesView } from "@/lib/user/parse-contribution-filters"
import { cn } from "@/lib/utils"
import { Route } from "next"

interface NotesViewSwitcherProps {
  value: NotesView
  className?: string
}

const VIEWS: { id: NotesView; label: string; icon: typeof GridViewIcon }[] = [
  { id: "table", label: "Table", icon: ListViewIcon },
  { id: "card", label: "Cards", icon: GridViewIcon },
]

export function NotesViewSwitcher({
  value,
  className,
}: NotesViewSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function changeView(nextView: NotesView) {
    const params = new URLSearchParams(searchParams.toString())

    if (nextView === "table") {
      params.delete("view")
    } else {
      params.set("view", nextView)
    }

    const query = params.toString()
    router.push((query ? `${pathname}?${query}` : pathname) as Route, {
      scroll: false,
    })
  }

  return (
    <div
      role="tablist"
      aria-label="Notes layout"
      className={cn(
        "inline-flex items-center rounded-lg border bg-muted/40 p-1",
        className
      )}
    >
      {VIEWS.map((view) => {
        const isActive = value === view.id
        return (
          <Button
            key={view.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            onClick={() => changeView(view.id)}
            className="h-8 gap-1.5 px-2.5"
          >
            <HugeiconsIcon
              icon={view.icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
            />
            {view.label}
          </Button>
        )
      })}
    </div>
  )
}
