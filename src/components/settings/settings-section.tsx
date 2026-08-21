import { cn } from "@/lib/utils"
import { SubHeading } from "@/components/ui/sub-heading"

export function SettingsSection({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-xl border bg-card p-5 sm:p-6", className)}>
      <SubHeading as="h3" className="mb-4 text-card-foreground">
        {title}
      </SubHeading>
      {children}
    </section>
  )
}
