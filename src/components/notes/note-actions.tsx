"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { NoteShareButton } from "./note-share-button"
import { NoteQrDialog } from "./note-qr-dialog"
import { PublicNote } from "@/types/note"
import { DownloadNoteButton } from "../shared/download-note-button"

interface NoteActionsProps {
  note: PublicNote
  fileUrl: string
}

export function NoteActions({ note, fileUrl }: NoteActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <DownloadNoteButton variant="brand" className="gap-2" noteId={note.id}>
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
    </div>
  )
}
