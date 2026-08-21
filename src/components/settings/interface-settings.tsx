"use client"

import { RADIUS_OPTIONS, DENSITY_OPTIONS } from "@/lib/appearance/preferences"
import { SettingsSection } from "./settings-section"
import { SegmentedControl } from "./segmented-control"
import { useAppearanceStore } from "@/hooks/use-appearance-store"

export function InterfaceSettings() {
  const radius = useAppearanceStore((s) => s.radius)
  const setRadius = useAppearanceStore((s) => s.setRadius)
  const density = useAppearanceStore((s) => s.density)
  const setDensity = useAppearanceStore((s) => s.setDensity)

  return (
    <SettingsSection title="Interface">
      <div className="space-y-5">
        <div>
          <span className="mb-2 block text-sm font-medium text-card-foreground">
            Corner radius
          </span>
          <SegmentedControl
            groupLabel="Corner radius"
            value={radius}
            onChange={setRadius}
            options={RADIUS_OPTIONS}
          />
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium text-card-foreground">
            Density
          </span>
          <SegmentedControl
            groupLabel="Density"
            value={density}
            onChange={setDensity}
            options={DENSITY_OPTIONS}
          />
        </div>
      </div>
    </SettingsSection>
  )
}
