import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export interface SessionStat {
  id: string
  icon: React.ReactNode
  iconWrapperClassName: string
  value: string
  label: string
  description: string
}

export function SessionStatCard({
  icon,
  iconWrapperClassName,
  value,
  label,
  description,
}: Omit<SessionStat, "id">) {
  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="flex flex-col items-center gap-3 text-center">
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-lg",
            iconWrapperClassName
          )}
        >
          {icon}
        </div>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {label ? (
          <div className="-mt-2 text-sm font-medium text-foreground">
            {label}
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
