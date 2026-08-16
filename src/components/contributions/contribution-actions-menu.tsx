"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalIcon,
  ViewIcon,
  Edit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ContributionListItem } from "@/types/contribution"
import { Route } from "next"

interface ContributionActionsMenuProps {
  contribution: ContributionListItem
  onViewDetails: (contribution: ContributionListItem) => void
}

export function ContributionActionsMenu({
  contribution,
  onViewDetails,
}: ContributionActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton={false}
        render={
          <Button variant="ghost" size="icon" className="size-8">
            <HugeiconsIcon
              icon={MoreVerticalIcon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
            />
            <span className="sr-only">Open actions</span>
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => onViewDetails(contribution)}>
          <HugeiconsIcon
            icon={ViewIcon}
            size={16}
            color="currentColor"
            strokeWidth={2}
            className="mr-2 size-4"
          />
          View Details
        </DropdownMenuItem>

        {contribution.status === "DRAFT" ? (
          <DropdownMenuItem
            nativeButton={false}
            render={
              <Link href={`/contribution/${contribution.id}/edit` as Route}>
                <HugeiconsIcon
                  icon={Edit02Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="mr-2 size-4"
                />
                Continue Editing
              </Link>
            }
          ></DropdownMenuItem>
        ) : null}

        {contribution.status === "REJECTED" ? (
          <DropdownMenuItem
            render={
              <Link href={`/contribution/${contribution.id}/edit` as Route}>
                <HugeiconsIcon
                  icon={Edit02Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="mr-2 size-4"
                />
                Edit &amp; Resubmit
              </Link>
            }
          ></DropdownMenuItem>
        ) : null}

        {contribution.status === "PUBLISHED" ? (
          <DropdownMenuItem
            render={
              <Link href={`/notes/${contribution.slug}`}>
                <HugeiconsIcon
                  icon={ViewIcon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="mr-2 size-4"
                />
                View Published Note
              </Link>
            }
          ></DropdownMenuItem>
        ) : null}

        {contribution.status === "PENDING_REVIEW" ? (
          <DropdownMenuItem onSelect={() => onViewDetails(contribution)}>
            <HugeiconsIcon
              icon={ViewIcon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="mr-2 size-4"
            />
            View Submission
          </DropdownMenuItem>
        ) : null}

        {contribution.status === "DRAFT" ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                // Deletion should go through a confirmation dialog + server action.
                // Left as a TODO integration point.
              }}
            >
              <HugeiconsIcon
                icon={Delete02Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="mr-2 size-4"
              />
              Delete Draft
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
