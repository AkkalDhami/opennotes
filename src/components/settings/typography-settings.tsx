"use client"

import { FONT_SIZE_OPTIONS } from "@/lib/appearance/preferences"
import { SettingsSection } from "./settings-section"
import { FontSelector } from "./font-selector"
import { SegmentedControl } from "./segmented-control"
import { useAppearanceStore } from "@/hooks/use-appearance-store"

export function TypographySettings() {
  const fontSize = useAppearanceStore((s) => s.fontSize)
  const setFontSize = useAppearanceStore((s) => s.setFontSize)

  return (
    <SettingsSection title="Typography">
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Font family
          </label>
          <FontSelector />
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium text-card-foreground">
            Font size
          </span>
          <SegmentedControl
            groupLabel="Font size"
            value={fontSize}
            onChange={setFontSize}
            options={FONT_SIZE_OPTIONS}
          />
        </div>
      </div>
    </SettingsSection>
  )
}
