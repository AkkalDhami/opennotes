"use client"

import Link from "next/link"

import {
  Folder01Icon,
  Globe02Icon,
  File01Icon,
  FolderLibraryIcon,
  IncognitoIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import { Route } from "next"
import { CollectionActionsMenu } from "./collection-actions-menu"
import { CollectionTreeNode } from "@/lib/user/collection-queries"

interface CollectionCardProps {
  collection: CollectionTreeNode
  href: string
  index: number
  className?: string
}

export function CollectionCard({
  collection,
  href,
  className,
  index,
}: CollectionCardProps) {
  const isPublic = collection.visibility === "PUBLIC"

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card",
        "transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between p-5 pb-3">
        <Link
          href={href as Route}
          className="flex min-w-0 flex-1"
          aria-label={`Open ${collection.name}`}
        >
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-xl",
              "bg-primary/10 text-primary",
              "transition-colors group-hover:bg-primary/15"
            )}
          >
            <HugeiconsIcon
              icon={Folder01Icon}
              size={26}
              color="currentColor"
              strokeWidth={2}
            />
          </div>
        </Link>
        <CollectionActionsMenu
          siblingCount={collection.children.length}
          siblingIndex={index}
          collection={collection}
        />
      </div>

      <Link href={href as Route} className="block space-y-2 px-5 pb-5">
        <h3 className="truncate text-base font-medium">{collection.name}</h3>

        {collection.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {collection.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <HugeiconsIcon
              icon={File01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
            {collection.stats.noteCount}{" "}
            {collection.stats.noteCount === 1 ? "note" : "notes"}
          </span>

          {collection.children.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <HugeiconsIcon
                icon={FolderLibraryIcon}
                size={16}
                color="currentColor"
                strokeWidth={2}
              />
              {collection.children.length}{" "}
              {collection.children.length === 1 ? "collection" : "collections"}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <HugeiconsIcon
              icon={isPublic ? Globe02Icon : IncognitoIcon}
              size={14}
              color="currentColor"
              strokeWidth={2}
            />

            {isPublic ? "Public" : "Private"}
          </span>

          <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Open →
          </span>
        </div>
      </Link>
    </article>
  )
}
