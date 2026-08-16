"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, LinkSquare01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { PublicNote } from "@/types/note"

interface NotePdfViewerProps {
  note: PublicNote
  fileUrl: string
}

export function NotePdfViewer({ note, fileUrl }: NotePdfViewerProps) {
  const [embedFailed, setEmbedFailed] = useState(false)

  return (
    <div id="viewer" className="scroll-mt-20">
      {!embedFailed ? (
        <div className="overflow-hidden rounded-lg border">
          <iframe
            src={fileUrl}
            title={`${note.title} — PDF preview`}
            className="h-[70vh] min-h-105 w-full sm:h-[80vh]"
            onError={() => setEmbedFailed(true)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            This browser can&apos;t preview PDFs inline.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              render={<a href={fileUrl} target="_blank" rel="noreferrer" />}
              className="gap-2"
            >
              <HugeiconsIcon
                icon={LinkSquare01Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
              Open PDF
            </Button>
            <Button
              variant="outline"
              render={<a href={`/api/notes/${note.id}/download`} />}
              className="gap-2"
            >
              <HugeiconsIcon
                icon={Download01Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
              Download PDF
            </Button>
          </div>
        </div>
      )}

      <p className="mt-2 text-center text-xs text-muted-foreground sm:hidden">
        Having trouble viewing?{" "}
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Open in a new tab
        </a>
      </p>
    </div>
  )
}
