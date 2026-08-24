"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Folder01Icon, Search01Icon } from "@hugeicons/core-free-icons"

import { CreateCollectionButton } from "./create-collection-button"

export function EmptyCollectionsState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <HugeiconsIcon
          icon={Folder01Icon}
          size={22}
          color="currentColor"
          strokeWidth={2}
        />
      </div>
      <h3 className="text-base font-semibold text-foreground">
        No collections yet
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Organize your notes into collections by subject, course, semester, or
        topic.
      </p>
      <CreateCollectionButton data={{}} />
    </div>
  )
}

export function NoSearchResultsState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <HugeiconsIcon
          icon={Search01Icon}
          size={22}
          color="currentColor"
          strokeWidth={2}
        />
      </div>
      <h3 className="text-base font-semibold text-foreground">
        No collections found
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Try a different collection name or search term.
      </p>
      <CreateCollectionButton data={{}} />
    </div>
  )
}
