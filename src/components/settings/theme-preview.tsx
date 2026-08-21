import { THEMES, ThemeName } from "@/lib/appearance/themes"

export function ThemePreview({
  theme,
  mode = "light",
}: {
  theme: ThemeName
  mode?: "light" | "dark"
}) {
  const t = THEMES[theme][mode]
  return (
    <div
      className="overflow-hidden rounded-md border"
      style={{ borderColor: t.border, background: t.background }}
    >
      <div className="space-y-1.5 p-2.5">
        <div
          className="h-1.5 w-2/3 rounded-full"
          style={{ background: t.mutedForeground, opacity: 0.5 }}
        />
        <div className="flex gap-1.5 pt-0.5">
          <div className="h-4 w-10 rounded" style={{ background: t.primary }} />
          <div
            className="h-4 flex-1 rounded"
            style={{ background: t.secondary }}
          />
        </div>
      </div>
    </div>
  )
}
