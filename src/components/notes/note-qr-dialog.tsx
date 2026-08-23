"use client"

import { useTransition } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  QrCodeIcon,
  Copy01Icon,
  Download01Icon,
  CheckIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "react-hot-toast"

import { PublicNote } from "@/types/note"
import { QrCode } from "@/components/shared/qr-code"
import { useOrigin } from "@/hooks/use-origin"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { generateNoteQrCompositeDataUrl } from "@/lib/notes/qr"
import { slugToTitle } from "@/utils/slug"
import { cn } from "@/lib/utils"

interface NoteQrDialogProps {
  note: PublicNote
}

export function NoteQrDialog({ note }: NoteQrDialogProps) {
  const canonicalPath = `/notes/${note.slug}`

  const origin = useOrigin()
  const url = `${origin}${canonicalPath}`
  const { copy, state } = useCopyToClipboard({
    onCopySuccess: () => toast.success("Link copied to clipboard"),
  })
  const [isPending, startTransition] = useTransition()

  async function handleDownloadWithMeta() {
    startTransition(async () => {
      try {
        const dataUrl = await generateNoteQrCompositeDataUrl({
          url,
          title: note.title,
          course: slugToTitle(note.course),
          subject: slugToTitle(note.subject),
          grade: slugToTitle(note.grade ?? ""),
        })
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = `${note.title.toLocaleLowerCase().replace(/ /g, "-")}-qr.png`
        document.body.appendChild(link)
        link.click()
        link.remove()
      } catch {
        toast.error("Failed to generate QR code image.")
      }
    })
  }

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
          value={url}
          size={260}
          fileName={`${note.title.toLocaleLowerCase().replace(/ /g, "-")}-qr.png`}
          alt={`QR code linking to ${note.title}`}
          showDownload={false}
        />

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            className={cn(
              "w-full gap-2",
              state === "done" && "text-green-500 hover:text-green-500"
            )}
            onClick={() => copy(url)}
          >
            <HugeiconsIcon
              icon={state === "done" ? CheckIcon : Copy01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className={cn("size-4")}
            />
            {state === "done" ? "Copied!" : "Copy Link"}
          </Button>

          <Button
            variant="default"
            className="w-full gap-2"
            onClick={handleDownloadWithMeta}
            disabled={isPending}
          >
            <HugeiconsIcon
              icon={Download01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
            />
            {isPending ? "Generating..." : "Download QR"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
