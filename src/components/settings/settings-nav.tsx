import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, PaintBoardIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    id: "profile",
    label: "Profile",
    icon: UserIcon,
    enabled: false,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: PaintBoardIcon,
    enabled: true,
  },
] as const

export function SettingsNav() {
  return (
    <nav
      aria-label="Settings sections"
      className="mx-1 mb-8 flex gap-1 border-b border-border px-1"
    >
      {NAV_ITEMS.map((item) => {
        const active = item.id === "appearance"
        return (
          <button
            key={item.id}
            type="button"
            disabled={!item.enabled}
            aria-current={active ? "page" : undefined}
            aria-disabled={!item.enabled}
            title={item.enabled ? undefined : "Coming soon"}
            className={cn(
              "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap",
              "disabled:cursor-not-allowed disabled:opacity-40",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            <HugeiconsIcon icon={item.icon} size={15} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
