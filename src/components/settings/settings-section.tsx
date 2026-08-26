import { cn } from "@/lib/utils"
import { SubHeading } from "@/components/ui/sub-heading"

export function SettingsSection({
  title,
  children,
  className,
  description,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-xl border bg-card p-5 sm:p-6", className)}>
      <div className="mb-4 space-y-2">
        <SubHeading as="h3" className="text-card-foreground">
          {title}
        </SubHeading>
        {description && (
          <SubHeading className="text-muted-foreground">
            {description}
          </SubHeading>
        )}
      </div>
      {children}
    </section>
  )
}
