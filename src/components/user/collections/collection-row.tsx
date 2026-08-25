"use client"

import { useState, type ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Folder01Icon,
  FolderOpenIcon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  Download01Icon,
  ViewIcon,
  File01Icon,
  Globe02Icon,
  DragDropVerticalIcon,
} from "@hugeicons/core-free-icons"

import { CollectionTreeNode } from "@/lib/user/collection-queries"
import { useModal } from "@/hooks/use-modal-store"
import { CollectionActionsMenu } from "./collection-actions-menu"
import { formatCompactNumber } from "@/utils/format"
import { formatRelativeTime } from "@/utils/format-date"
import { cn } from "@/lib/utils"
import type { DragConnectorRef } from "./collection-dnd"

/** One number and its glyph, right-aligned in the row's data column. */
function RowStat({
  icon,
  value,
  label,
}: {
  icon: typeof File01Icon
  value: number
  label: string
}) {
  return (
    <span className="flex w-14 items-center justify-end gap-1 tabular-nums">
      <HugeiconsIcon
        icon={icon}
        size={13}
        color="currentColor"
        strokeWidth={2}
        className="shrink-0 opacity-60"
      />
      <span className="sr-only">{label}</span>
      {formatCompactNumber(value)}
    </span>
  )
}

export function CollectionRow({
  node,
  depth,
  siblingCount,
  siblingIndex,
  rowRef,
  dragHandleRef,
  isDragging = false,
  childrenSlot,
}: {
  node: CollectionTreeNode
  depth: number
  siblingCount: number
  siblingIndex: number
  /**
   * Drop target / drag preview connector, attached to the row header rather
   * than the whole subtree so the swap midpoint is measured against one row and
   * an expanded row's children don't count as part of its hover area.
   */
  rowRef?: DragConnectorRef
  /** Present only when this sibling group is reorderable. */
  dragHandleRef?: DragConnectorRef
  isDragging?: boolean
  /**
   * The nested sibling group, rendered by the caller so it can be wrapped in
   * its own sortable list. Only mounted while this row is expanded.
   */
  childrenSlot?: ReactNode
}) {
  const [expanded, setExpanded] = useState(depth === 0)
  const { open } = useModal()

  const hasChildren = node.children.length > 0
  // eslint-disable-next-line react-hooks/refs
  const isReorderable = Boolean(dragHandleRef)
  const isPublic = node.visibility === "PUBLIC"

  return (
    <div role="tree-item" aria-expanded={hasChildren ? expanded : undefined}>
      <div
        ref={rowRef}
        className={cn(
          "group flex items-center gap-2 border-l-2 border-transparent px-4 py-2.5 transition-colors",
          "hover:border-l-foreground/20 hover:bg-muted/40",
          "focus-within:border-l-foreground/20 focus-within:bg-muted/40",
          isDragging && "bg-muted/60 opacity-50"
        )}
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        {isReorderable ? (
          // Not a button: a drag handle can't be operated from the keyboard, so
          // advertising it as a control would be a dead end. Keyboard and
          // screen-reader users reorder with Move up / Move down in the actions
          // menu instead.
          <span
            ref={dragHandleRef}
            aria-hidden
            title="Drag to reorder"
            className="flex h-6 w-5 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground/50 opacity-70 transition-opacity active:cursor-grabbing sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
          >
            <HugeiconsIcon
              icon={DragDropVerticalIcon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
          </span>
        ) : null}

        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={
              expanded ? `Collapse ${node.name}` : `Expand ${node.name}`
            }
            className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <HugeiconsIcon
              icon={expanded ? ArrowDown01Icon : ArrowRight01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
          </button>
        ) : (
          <span className="size-6 shrink-0" aria-hidden />
        )}

        {/* Opens the details dialog rather than navigating: the list stays put,
            and drilling into a subcollection is one more click inside it. */}
        <button
          type="button"
          onClick={() =>
            open("collection-details", {
              collectionDetails: { id: node.id, name: node.name },
            })
          }
          className="flex min-w-0 flex-1 items-center gap-3 rounded text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground/70 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <HugeiconsIcon
              icon={expanded && hasChildren ? FolderOpenIcon : Folder01Icon}
              size={17}
              color="currentColor"
              strokeWidth={2}
            />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium">{node.name}</span>

              {isPublic && (
                <HugeiconsIcon
                  icon={Globe02Icon}
                  size={13}
                  color="currentColor"
                  strokeWidth={2}
                  className="shrink-0 text-muted-foreground"
                  aria-label="Public"
                />
              )}
            </span>

            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {node.description ||
                `Updated ${formatRelativeTime(new Date(node.updatedAt))}`}
            </span>
          </span>
        </button>

        <div className="hidden shrink-0 items-center gap-2 text-xs text-muted-foreground sm:flex">
          <RowStat
            icon={File01Icon}
            value={node.stats.noteCount}
            label="Notes"
          />
          <RowStat
            icon={Download01Icon}
            value={node.stats.downloadCount}
            label="Downloads"
          />
          <RowStat icon={ViewIcon} value={node.stats.viewCount} label="Views" />
        </div>

        <CollectionActionsMenu
          collection={node}
          siblingCount={siblingCount}
          siblingIndex={siblingIndex}
        />
      </div>

      {hasChildren && expanded ? <div>{childrenSlot}</div> : null}
    </div>
  )
}
