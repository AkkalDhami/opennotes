import Link from "next/link"
import { ViewIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ApproveContributionButton } from "./approve-contribution-button"
import { RejectContributionDialog } from "./reject-contribution-dialog"
import { RemoveContributionDialog } from "./remove-contribution-dialog"
import { RestoreContributionDialog } from "./restore-contribution-dialog"
import { NoteStatus } from "@/db/schemas/note.schema"

export function ContributionActions({
  noteId,
  noteTitle,
  status,
}: {
  noteId: string
  noteTitle: string
  status: NoteStatus
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="sm"
              variant="ghost"
              render={
                <Link
                  href={`/admin/contributions/${noteId}`}
                  aria-label="View contribution"
                >
                  <HugeiconsIcon
                    icon={ViewIcon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                    aria-hidden="true"
                  />
                </Link>
              }
            ></Button>
          }
        ></TooltipTrigger>
        <TooltipContent>View</TooltipContent>
      </Tooltip>

      {status === "PENDING_REVIEW" && (
        <>
          <ApproveContributionButton noteId={noteId} />
          <RejectContributionDialog noteId={noteId} />
        </>
      )}

      {status === "PUBLISHED" && (
        <RemoveContributionDialog noteId={noteId} noteTitle={noteTitle} />
      )}

      {status === "REJECTED" && (
        <RestoreContributionDialog
          noteId={noteId}
          noteTitle={noteTitle}
          fromStatus="REJECTED"
        />
      )}

      {status === "REMOVED" && (
        <RestoreContributionDialog
          noteId={noteId}
          noteTitle={noteTitle}
          fromStatus="REMOVED"
        />
      )}
    </div>
  )
}
