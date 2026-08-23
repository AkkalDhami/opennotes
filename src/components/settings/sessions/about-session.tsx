import { SubHeading } from "@/components/ui/sub-heading"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface AboutSessionsProps {
  title?: string
  items: string[]
}

export function AboutSessions({
  title = "About sessions",
  items,
}: AboutSessionsProps) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-lg border bg-muted/50 p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={18}
            strokeWidth={2}
            className="text-primary"
          />
          <SubHeading as="h3">{title}</SubHeading>
        </div>
        <ul className="mt-3 space-y-2 text-[15px] text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden className="text-muted-foreground/60">
                •
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
