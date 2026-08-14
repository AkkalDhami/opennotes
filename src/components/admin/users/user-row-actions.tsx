"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreHorizontalIcon,
  ViewIcon,
  Note01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Route } from "next"

interface UserRowActionsProps {
  userId: string
  userName: string | null
}

export function UserRowActions({ userId, userName }: UserRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={(event) => event.stopPropagation()}
            aria-label={`Actions for ${userName ?? "this user"}`}
          >
            <HugeiconsIcon
              icon={MoreHorizontalIcon}
              size={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          render={
            <Link href={`/admin/users/${userId}`}>
              <HugeiconsIcon
                icon={ViewIcon}
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              View profile
            </Link>
          }
        ></DropdownMenuItem>
        <DropdownMenuItem
          render={
            <Link href={`/admin/users/${userName}/notes` as Route}>
              <HugeiconsIcon
                icon={Note01Icon}
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              View notes
            </Link>
          }
        ></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
