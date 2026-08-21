import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"

export function DashboardHeader({ greet }: { greet: string }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Heading>{greet}</Heading>
        <SubHeading>
          Monitor notes, contributors, moderation, and platform activity.
        </SubHeading>
      </div>
      <Button
        variant="outline"
        render={
          <Link href="/" target="_blank" className="gap-2">
            View platform
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
            />
          </Link>
        }
      />
    </div>
  )
}
