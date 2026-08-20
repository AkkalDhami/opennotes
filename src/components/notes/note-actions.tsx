"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download01Icon,
  ArrowUpRight01Icon,
  Copy01Icon,
  MoreVerticalSquare01Icon,
  Flag02Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { NoteShareButton } from "./note-share-button"
import { NoteQrDialog } from "./note-qr-dialog"
import { PublicNote } from "@/types/note"
import { DownloadNoteButton } from "@/components/shared/download-note-button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useModal } from "@/hooks/use-modal-store"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useOrigin } from "@/hooks/use-origin"
import { toast } from "react-hot-toast"

interface NoteActionsProps {
  note: PublicNote
  fileUrl: string
}

export function NoteActions({ note, fileUrl }: NoteActionsProps) {
  const { open } = useModal()

  const { copy } = useCopyToClipboard()
  const origin = useOrigin()

  function handleCopyLink() {
    copy(`${origin}/notes/${note.slug}`)
    toast.success("Link copied successfully!")
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <DownloadNoteButton variant="default" className="gap-2" noteId={note.id}>
        <HugeiconsIcon
          icon={Download01Icon}
          size={16}
          color="currentColor"
          strokeWidth={2}
          className="size-4"
        />
        Download PDF
      </DownloadNoteButton>
      <Button
        size="sm"
        variant="outline"
        nativeButton={false}
        render={
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={16}
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />
            Open in new tab
          </a>
        }
      ></Button>

      <NoteShareButton note={note} />
      <NoteQrDialog note={note} />

      <ButtonGroup>
        <Button variant="outline">More</Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon" aria-label="More Options">
                <HugeiconsIcon
                  icon={MoreVerticalSquare01Icon}
                  size={16}
                  strokeWidth={2}
                  className="size-4"
                  aria-hidden="true"
                />
              </Button>
            }
          />

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  open("report-note", {
                    reportNoteId: note.id,
                  })
                }
              >
                <HugeiconsIcon
                  icon={Flag02Icon}
                  size={16}
                  strokeWidth={2}
                  className="size-4"
                  aria-hidden="true"
                />
                Report note
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleCopyLink}>
                <HugeiconsIcon
                  key={"idle"}
                  icon={Copy01Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                />
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  )
}
