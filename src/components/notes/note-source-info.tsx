import {
  Globe02Icon,
  LicenseIcon,
  Link02Icon,
  Shield01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import { NoteSourceType } from "@/db"

interface NoteSourceInfoProps {
  sourceType: NoteSourceType
  originalAuthor?: string | null
  sourceUrl?: string | null
}

const SOURCE_INFO = {
  PERMISSION_GRANTED: {
    title: "Shared with permission",
    description:
      "This material was shared with permission from the original author or rights holder.",
    icon: Shield01Icon,
  },
  OPEN_LICENSE: {
    title: "Shared under an open license",
    description:
      "This material is available under a license that permits sharing.",
    icon: LicenseIcon,
  },
  PUBLIC_DOMAIN: {
    title: "Public domain material",
    description: "This material is believed to be in the public domain.",
    icon: Globe02Icon,
  },
} as const

export function NoteSourceInfo({
  sourceType,
  originalAuthor,
  sourceUrl,
}: NoteSourceInfoProps) {
  if (sourceType === "ORIGINAL") {
    return null
  }

  const info = SOURCE_INFO[sourceType]

  return (
    <section
      aria-labelledby="note-source-heading"
      className="rounded-lg border bg-muted/20 p-4"
    >
      <div className="flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <HugeiconsIcon
            icon={info.icon}
            size={18}
            color="currentColor"
            strokeWidth={2}
            className="text-primary"
          />
        </div>

        <div className="min-w-0">
          <h2 id="note-source-heading" className="font-medium">
            {info.title}
          </h2>

          <p className="text-sm text-muted-foreground">{info.description}</p>
        </div>
      </div>

      {(originalAuthor || sourceUrl) && (
        <div className="mt-4 space-y-3 border-t pt-4">
          {originalAuthor && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Original author
              </p>

              <p className="mt-1 flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={UserIcon}
                  size={15}
                  color="currentColor"
                  strokeWidth={2}
                  className="shrink-0"
                />
                {originalAuthor}
              </p>
            </div>
          )}

          {sourceUrl && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Source
              </p>

              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "mt-1 inline-flex max-w-full items-center gap-1.5",
                  "text-primary hover:underline",
                  "break-all"
                )}
              >
                <HugeiconsIcon
                  icon={Link02Icon}
                  size={15}
                  color="currentColor"
                  strokeWidth={2}
                  className="shrink-0"
                />

                <span className="truncate">{sourceUrl}</span>
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
