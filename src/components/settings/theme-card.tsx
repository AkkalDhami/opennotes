"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import type { ThemeName } from "@/lib/appearance/themes"
import { cn } from "@/lib/utils"
import { ThemePreview } from "./theme-preview"

export function ThemeCard({
  id,
  name,
  description,
  mode,
  selected,
  onSelect,
}: {
  id: ThemeName
  name: string
  description: string
  mode: "light" | "dark"
  selected: boolean
  onSelect: (id: ThemeName) => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${name} theme: ${description}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => onSelect(id)}
      className={cn(
        "rounded-lg border bg-card p-3 text-left transition-colors outline-none hover:bg-muted",
        "ring-2 ring-transparent hover:ring-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected ? "border-primary ring-1 ring-primary" : "border-border"
      )}
    >
      <div className="mb-3">
        <ThemePreview theme={id} mode={mode} />
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-primary bg-primary"
              : "border-border bg-transparent"
          )}
        >
          {selected && (
            <HugeiconsIcon
              icon={Tick02Icon}
              size={11}
              strokeWidth={3}
              color="var(--primary-foreground)"
            />
          )}
        </span>
        <span className="text-sm font-medium text-card-foreground">{name}</span>
      </div>
      <p className="mt-1 ml-6 text-xs text-muted-foreground">{description}</p>
    </button>
  )
}
