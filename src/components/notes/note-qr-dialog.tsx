"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { QrCodeIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { PublicNote } from "@/types/note"
import { QrCode } from "@/components/shared/qr-code"
import { useOrigin } from "@/hooks/use-origin";

interface NoteQrDialogProps {
  note: PublicNote
}

export function NoteQrDialog({ note }: NoteQrDialogProps) {
  const canonicalPath = `/notes/${note.slug}`

  const origin = useOrigin()

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2">
            <HugeiconsIcon
              icon={QrCodeIcon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
            />
            Generate QR
          </Button>
        }
      />

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Share this note</DialogTitle>
          <DialogDescription>
            Scan this QR code to open this note.
          </DialogDescription>
        </DialogHeader>

        <QrCode
          value={`${origin}${canonicalPath}`}
          fileName={`${note.slug}-qr.png`}
          alt={`QR code linking to ${note.title}`}
        />
      </DialogContent>
    </Dialog>
  )
}
