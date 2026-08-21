"use client"

import { THEME_PREVIEWS } from "@/lib/appearance/themes"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ThemeCard } from "./theme-card"
import { handleRadioGroupKeyDown } from "@/hooks/use-roving-radio-group"
import { useAppearanceStore } from "@/hooks/use-appearance-store"

export function ThemeSelector() {
  const theme = useAppearanceStore((s) => s.theme)
  const setTheme = useAppearanceStore((s) => s.setTheme)
  const mode = useAppearanceStore((s) => s.mode)
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)")
  const effectiveMode =
    mode === "system" ? (systemDark ? "dark" : "light") : mode

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      onKeyDown={handleRadioGroupKeyDown}
      className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4"
    >
      {THEME_PREVIEWS.map((t) => (
        <ThemeCard
          key={t.id}
          id={t.id}
          name={t.name}
          description={t.description}
          mode={effectiveMode}
          selected={theme === t.id}
          onSelect={setTheme}
        />
      ))}
    </div>
  )
}
