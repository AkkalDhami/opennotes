import { SubHeading } from "@/components/ui/sub-heading"
import { SquareLock02Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface SecurityTipsProps {
  title?: string
  tips: string[]
}

export function SecurityTips({
  title = "Security Tips",
  tips,
}: SecurityTipsProps) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-lg border bg-muted/50 p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={SquareLock02Icon}
            size={18}
            strokeWidth={1.8}
            className="size-5 text-primary"
          />
          <SubHeading as="h3">{title}</SubHeading>
        </div>
        <ul className="mt-3 space-y-2 text-[15px] text-muted-foreground">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <HugeiconsIcon
                icon={Tick02Icon}
                size={16}
                className="mt-0.5 shrink-0 text-emerald-500"
              />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
