"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Sun03Icon,
  Moon02Icon,
  ComputerIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import {
  AppearanceMode,
  DISPLAY_MODE_OPTIONS,
} from "@/lib/appearance/preferences"
import { cn } from "@/lib/utils"
import { useAppearanceStore } from "@/hooks/use-appearance-store"
import { handleRadioGroupKeyDown } from "@/hooks/use-roving-radio-group"

const ICONS = {
  light: Sun03Icon,
  dark: Moon02Icon,
  system: ComputerIcon,
} as const

export function DisplayModeSelector() {
  const mode = useAppearanceStore((s) => s.mode)
  const setMode = useAppearanceStore((s) => s.setMode)

  function toggleTheme(mode: AppearanceMode) {
    if (!document.startViewTransition) {
      setMode(mode)
      return
    }

    document.startViewTransition(() => setMode(mode))
  }

  return (
    <div
      role="radiogroup"
      aria-label="Display mode"
      onKeyDown={handleRadioGroupKeyDown}
      className="grid gap-3 sm:grid-cols-3"
    >
      {DISPLAY_MODE_OPTIONS.map((option) => {
        const selected = mode === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => toggleTheme(option.value)}
            className={cn(
              "rounded-lg border bg-card p-3 text-left transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected ? "border-primary ring-1 ring-primary" : "border-border"
            )}
          >
            <div className="mb-3 overflow-hidden rounded-md border border-border">
              <ModePreview mode={option.value} />
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
              <HugeiconsIcon
                icon={ICONS[option.value]}
                size={14}
                className="text-muted-foreground"
              />
              <span className="text-sm font-medium text-card-foreground">
                {option.label}
              </span>
            </div>
            <p className="mt-1 ml-6 text-xs text-muted-foreground">
              {option.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}

function ModePreview({ mode }: { mode: "light" | "dark" | "system" }) {
  const isSplit = mode === "system"
  const isDark = mode === "dark"
  return (
    <div
      className="space-y-1.5 p-2.5"
      style={{
        background: isSplit
          ? "linear-gradient(90deg, #f4f4f4 50%, #1c1c1c 50%)"
          : isDark
            ? "#1c1c1c"
            : "#f4f4f4",
      }}
    >
      <div
        className="h-1.5 w-3/4 rounded-full"
        style={{
          background: isSplit
            ? "linear-gradient(90deg,#999 50%,#666 50%)"
            : isDark
              ? "#666"
              : "#aaa",
        }}
      />
      <div
        className="h-1.5 w-1/2 rounded-full"
        style={{
          background: isSplit
            ? "linear-gradient(90deg,#bbb 50%,#444 50%)"
            : isDark
              ? "#444"
              : "#ccc",
        }}
      />
      <div className="flex gap-1 pt-0.5">
        <div
          className="h-4 flex-1 rounded"
          style={{ background: "var(--primary)" }}
        />
        <div
          className="h-4 flex-1 rounded"
          style={{
            background: isSplit
              ? "linear-gradient(90deg,#ddd 50%,#3a3a3a 50%)"
              : isDark
                ? "#3a3a3a"
                : "#e2e2e2",
          }}
        />
      </div>
    </div>
  )
}
