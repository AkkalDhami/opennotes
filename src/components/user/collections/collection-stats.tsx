import { HugeiconsIcon } from "@hugeicons/react"
import {
  Folder01Icon,
  File01Icon,
  Download01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { CollectionLibraryStats } from "@/lib/user/collection-queries"
import { formatCompactNumber } from "@/utils/format"

const CARDS = [
  {
    key: "collectionCount",
    label: "Collections",
    icon: Folder01Icon,
  },
  {
    key: "noteCount",
    label: "Notes",
    icon: File01Icon,
  },
  {
    key: "downloadCount",
    label: "Downloads",
    icon: Download01Icon,
  },
  {
    key: "viewCount",
    label: "Views",
    icon: ViewIcon,
  },
] as const

export function CollectionsStats({ stats }: { stats: CollectionLibraryStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CARDS.map(({ key, label, icon }) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <HugeiconsIcon
              icon={icon}
              size={18}
              color="currentColor"
              strokeWidth={2}
            />
          </div>
          <div className="min-w-0">
            <div className="text-lg leading-none font-semibold tabular-nums">
              {formatCompactNumber(stats[key])}
            </div>
            <div className="mt-1 truncate text-xs text-muted-foreground">
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
