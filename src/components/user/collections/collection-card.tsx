"use client"

import {
  Folder01Icon,
  FolderOpenIcon,
  Globe02Icon,
  IncognitoIcon,
  DragDropVerticalIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import { useModal } from "@/hooks/use-modal-store"
import { formatCompactNumber } from "@/utils/format"
import { CollectionActionsMenu } from "./collection-actions-menu"
import { CollectionTreeNode } from "@/lib/user/collection-queries"
import type { DragConnectorRef } from "./collection-dnd"

interface CollectionCardProps {
  collection: CollectionTreeNode
  /** Position within the sibling group, for the menu's Move up / Move down. */
  index: number
  /** How many collections share this card's parent. */
  siblingCount: number
  className?: string
  /** Drop target / drag preview connector for the whole card. */
  cardRef?: DragConnectorRef
  /** Present only when this sibling group is reorderable. */
  dragHandleRef?: DragConnectorRef
  isDragging?: boolean
}

export function CollectionCard({
  collection,
  className,
  index,
  siblingCount,
  cardRef,
  dragHandleRef,
  isDragging = false,
}: CollectionCardProps) {
  const { open } = useModal()

  const isPublic = collection.visibility === "PUBLIC"
  const childCount = collection.children.length

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative flex h-full flex-col rounded-xl border border-border bg-card",
        "transition-colors duration-200 hover:border-foreground/20 hover:bg-muted/30",
        "focus-within:border-foreground/20",
        isDragging && "opacity-50 ring-2 ring-primary/40",
        className
      )}
    >
      {/*
        One stretched button instead of two links around the content: the card
        opens a details dialog now, and a single hit target means the grip and
        the actions menu are the only other things that can be clicked. It sits
        below the content, which is pointer-events-none, so clicks anywhere that
        isn't a control land here.
      */}
      <button
        type="button"
        onClick={() =>
          open("collection-details", {
            collectionDetails: { id: collection.id, name: collection.name },
          })
        }
        className="absolute inset-0 z-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span className="sr-only">View details for {collection.name}</span>
      </button>

      <div className="pointer-events-none relative z-10 flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="relative shrink-0">
            {/* A hairline square offset behind the tile, only when something is
                nested inside — the card says "there's more under here" before
                you read the count. */}
            {childCount > 0 && (
              <span
                aria-hidden
                className="absolute top-1 left-1 size-10 rounded-lg border border-border"
              />
            )}
            <span className="relative flex size-10 items-center justify-center rounded-lg bg-muted text-foreground/70 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <HugeiconsIcon
                icon={childCount > 0 ? FolderOpenIcon : Folder01Icon}
                size={20}
                color="currentColor"
                strokeWidth={2}
              />
            </span>
          </span>

          <div className="pointer-events-auto relative z-20 -mt-1 -mr-1 flex shrink-0 items-center">
            {dragHandleRef ? (
              // Not a button — a drag handle has no keyboard equivalent, so it
              // is hidden from assistive tech and Move up / Move down in the
              // actions menu is the accessible path.
              <span
                ref={dragHandleRef}
                aria-hidden
                title="Drag to reorder"
                className="flex size-8 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground/50 opacity-70 transition-opacity hover:bg-muted active:cursor-grabbing sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
              >
                <HugeiconsIcon
                  icon={DragDropVerticalIcon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                />
              </span>
            ) : null}

            <CollectionActionsMenu
              siblingCount={siblingCount}
              siblingIndex={index}
              collection={collection}
            />
          </div>
        </div>

        <h3 className="mt-3.5 truncate text-[15px] leading-snug font-medium tracking-tight">
          {collection.name}
        </h3>

        {collection.description ? (
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {collection.description}
          </p>
        ) : null}
      </div>

      {/* Spec line: the same hairline-and-numbers treatment the details dialog
          uses, so a card and its dialog read as one object. */}
      <div className="pointer-events-none relative z-10 mt-auto flex items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5 truncate tabular-nums">
          <span className="font-medium text-foreground">
            {formatCompactNumber(collection.stats.noteCount)}
          </span>
          {collection.stats.noteCount === 1 ? "note" : "notes"}
          {childCount > 0 && (
            <>
              <span aria-hidden className="text-muted-foreground/40">
                ·
              </span>
              <span className="font-medium text-foreground">{childCount}</span>
              inside
            </>
          )}
        </span>

        <span
          className="flex shrink-0 items-center gap-1"
          title={isPublic ? "Public collection" : "Private collection"}
        >
          <HugeiconsIcon
            icon={isPublic ? Globe02Icon : IncognitoIcon}
            size={13}
            color="currentColor"
            strokeWidth={2}
          />
          <span className="sr-only sm:not-sr-only">
            {isPublic ? "Public" : "Private"}
          </span>
        </span>
      </div>
    </article>
  )
}
