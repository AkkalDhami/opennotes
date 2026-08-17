import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"

interface UsersPageHeaderProps {
  title: string
  description: string
}

export function AdminPageHeader({ title, description }: UsersPageHeaderProps) {
  return (
    <div className="space-y-2">
      <Heading>{title}</Heading>
      <SubHeading>{description}</SubHeading>
    </div>
  )
}
