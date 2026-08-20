"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowUpRight01Icon,
  FileNotFoundIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { DownloadNoteButton } from "@/components/shared/download-note-button"

export function ContributionPdfPreview({
  fileUrl,
  title,
  noteId,
}: {
  fileUrl: string | null
  title: string
  noteId: string
}) {
  const [loaded, setLoaded] = useState(false)

  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <HugeiconsIcon
          icon={FileNotFoundIcon}
          size={32}
          strokeWidth={2}
          className="size-8 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm text-muted-foreground">
          Couldn&apos;t load the PDF preview. The file may be missing or the
          storage service is unavailable.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-2">
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

        <DownloadNoteButton noteId={noteId} />
      </div>

      <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg border border-border bg-muted sm:aspect-4/3">
        {!loaded && <Skeleton className="absolute inset-0" />}
        <iframe
          src={fileUrl}
          title={`Preview of ${title}`}
          className="size-full"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  )
}
