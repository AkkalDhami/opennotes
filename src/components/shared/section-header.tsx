"use client"

import Link from "next/link"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { Route } from "next"

interface SectionHeaderProps {
  headingId: string
  title: string
  description: string
  viewAllHref: string
  viewAllLabel?: string
}

export function SectionHeader({
  headingId,
  title,
  description,
  viewAllHref,
  viewAllLabel,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Heading id={headingId}>{title}</Heading>
        <SubHeading>{description}</SubHeading>
      </div>

      {viewAllLabel && (
        <Link
          href={viewAllHref as Route}
          className="group inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
          {viewAllLabel}
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={24}
            color="currentColor"
            strokeWidth={2}
            className="size-4"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  )
}
