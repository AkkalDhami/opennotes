"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowUpRight01Icon,
  Download01Icon,
  FileNotFoundIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

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

  // // ImageKit supports forcing a download via this query param, avoiding a
  // // second upload/copy of the file for moderation purposes.
  // const downloadUrl = `${fileUrl}${fileUrl.includes("?") ? "&" : "?"}ik-attachment=true`

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
        <Button
          size="sm"
          variant="outline"
          render={
            <a href={`/api/notes/${noteId}/download`}>
              <HugeiconsIcon
                icon={Download01Icon}
                size={16}
                strokeWidth={2}
                className="size-4"
                aria-hidden="true"
              />
              Download
            </a>
          }
        ></Button>
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
