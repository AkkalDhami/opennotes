"use client"

import { Switch } from "@/components/ui/switch"
import { useAppearanceStore } from "@/hooks/use-appearance-store"
import { SettingsSection } from "./settings-section"

export function AccessibilitySettings() {
  const reduceMotion = useAppearanceStore((state) => state.reduceMotion)
  const setReduceMotion = useAppearanceStore((state) => state.setReduceMotion)

  return (
    <SettingsSection title="Accessibility" className="hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-card-foreground">
            Reduce motion
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Minimize transitions and decorative animations.
          </p>
        </div>

        <Switch
          checked={reduceMotion}
          onCheckedChange={setReduceMotion}
          aria-label="Reduce motion"
        />
      </div>
    </SettingsSection>
  )
}
