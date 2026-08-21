"use client"

import { DENSITY_TOKENS } from "@/lib/appearance/preferences"
import { SettingsSection } from "./settings-section"
import { DisplayModeSelector } from "./display-mode-selector"
import { ThemeSelector } from "./theme-selector"
import { TypographySettings } from "./typography-settings"
import { InterfaceSettings } from "./interface-settings"
import { AccessibilitySettings } from "./accessibility-settings"
import { ResetPreferencesDialog } from "./reset-preferences-dialog"
import { useAppearanceStore } from "@/hooks/use-appearance-store"

export function AppearanceSettings() {
  const density = useAppearanceStore((s) => s.density)
  const sectionGap = DENSITY_TOKENS[density].sectionGap

  return (
    <div className="space-y-4">
      <div className={`flex flex-col ${sectionGap}`}>
        <SettingsSection title="Display mode">
          <DisplayModeSelector />
        </SettingsSection>

        <SettingsSection title="Color theme">
          <ThemeSelector />
        </SettingsSection>

        <TypographySettings />
        <InterfaceSettings />
        <AccessibilitySettings />

        <div>
          <ResetPreferencesDialog />
        </div>
      </div>
    </div>
  )
}
