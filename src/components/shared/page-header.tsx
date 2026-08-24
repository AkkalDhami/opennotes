import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"
import { cn } from "@/lib/utils"

interface UsersPageHeaderProps {
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: UsersPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <div className="space-y-2">
        <Heading>{title}</Heading>
        {description && <SubHeading>{description}</SubHeading>}
      </div>

      {children}
    </div>
  )
}
