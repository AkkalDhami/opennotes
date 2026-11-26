import { HugeiconsIcon } from "@hugeicons/react"
import { Flag02Icon, Mail01Icon } from "@hugeicons/core-free-icons"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { externalLinkProps, links, type NoteRef } from "@/lib/feedback-links"
import Link from "next/link"
import { Route } from "next"

export function NoteFeedbackMenuItems({ note }: { note: NoteRef }) {
  return (
    <>
      <DropdownMenuItem
        render={
          <Link href={links.reportNote(note) as Route} {...externalLinkProps}>
            <HugeiconsIcon icon={Flag02Icon} />
            Report this note
          </Link>
        }
      ></DropdownMenuItem>
      <DropdownMenuItem
        render={
          <Link href={links.copyright(note) as Route}>
            <HugeiconsIcon icon={Mail01Icon} />
            Copyright issue?
          </Link>
        }
      ></DropdownMenuItem>
    </>
  )
}
