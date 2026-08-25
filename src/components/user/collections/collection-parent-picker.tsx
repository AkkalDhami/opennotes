"use client"

import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Folder01Icon,
  FolderLibraryIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  CollectionPickerTree,
  type PickerCollectionNode,
} from "@/components/user/collections/collection-picker-tree"
import {
  filterCollectionTree,
  findTreeNode,
} from "@/lib/user/collection-tree-search"

interface CollectionParentPickerProps<T extends PickerCollectionNode> {
  nodes: T[]
  /** `null` means "top level" — a real choice, not an empty state. */
  value: string | null
  onChange: (parentId: string | null) => void
  /** Invalid targets, e.g. a collection's own subtree when re-parenting. */
  disabledIds?: Set<string>
  disabledLabel?: string
  topLevelLabel?: string
  topLevelDescription?: string
  /** Footer copy when nothing is selected. */
  topLevelSummary?: string
  /** Footer copy prefix when a parent is selected, e.g. "Nesting under". */
  nestedSummaryPrefix?: string
  searchPlaceholder?: string
  emptyLabel?: string
  className?: string
  id?: string
}

/**
 * Single-select parent chooser built on {@link CollectionPickerTree}.
 *
 * Replaces the flat `<Select>` this used to be: base-ui's `Select.Value`
 * renders the raw value, which surfaced a bare uuid instead of the collection
 * name, and a flat option list couldn't convey nesting anyway. Clicking the
 * selected row again clears back to top level.
 */
export function CollectionParentPicker<T extends PickerCollectionNode>({
  nodes,
  value,
  onChange,
  disabledIds,
  disabledLabel = "Not allowed",
  topLevelLabel = "None (top level)",
  topLevelDescription = "Keep this collection at the top of your library",
  topLevelSummary = "Will be created at the top level",
  nestedSummaryPrefix = "Nesting under",
  searchPlaceholder = "Search collections...",
  emptyLabel = "You don't have any other collections yet.",
  className,
  id,
}: CollectionParentPickerProps<T>) {
  const [search, setSearch] = useState("")

  const { tree: visibleTree, expandIds } = useMemo(
    () => filterCollectionTree(nodes, search),
    [nodes, search]
  )

  const selectedIds = useMemo(() => new Set(value ? [value] : []), [value])

  const selectedNode = useMemo(
    () => (value ? findTreeNode(nodes, value) : null),
    [nodes, value]
  )

  const isTopLevel = value === null

  function handleToggle(node: T) {
    // Re-selecting the current parent clears it, so "move to top level" doesn't
    // need a separate gesture.
    onChange(node.id === value ? null : node.id)
  }

  return (
    <div className={cn("rounded-lg border border-border", className)} id={id}>
      {nodes.length > 3 && (
        <div className="relative border-b border-border p-2">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-8 pl-8 text-sm"
          />
        </div>
      )}

      <div className="max-h-56 overflow-y-auto p-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-pressed={isTopLevel}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted/40",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            isTopLevel && "bg-primary/5"
          )}
        >
          <span
            aria-hidden
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded-full border",
              isTopLevel ? "border-primary" : "border-input"
            )}
          >
            {isTopLevel && <span className="size-2 rounded-full bg-primary" />}
          </span>

          <HugeiconsIcon
            icon={FolderLibraryIcon}
            size={18}
            color="currentColor"
            strokeWidth={2}
            className="shrink-0 text-muted-foreground"
          />

          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{topLevelLabel}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {topLevelDescription}
            </span>
          </span>
        </button>

        {nodes.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : visibleTree.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            No collections match &ldquo;{search}&rdquo;.
          </p>
        ) : (
          <CollectionPickerTree
            nodes={visibleTree}
            selectedIds={selectedIds}
            disabledIds={disabledIds}
            disabledLabel={disabledLabel}
            forceExpandIds={expandIds}
            onToggle={handleToggle}
            selectionMode="single"
          />
        )}
      </div>

      <p className="flex items-center gap-1.5 border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <HugeiconsIcon
          icon={Folder01Icon}
          size={14}
          color="currentColor"
          strokeWidth={2}
          className="shrink-0"
        />
        <span className="truncate">
          {selectedNode ? (
            <>
              {nestedSummaryPrefix}{" "}
              <strong className="font-medium text-foreground">
                {selectedNode.name}
              </strong>
            </>
          ) : (
            topLevelSummary
          )}
        </span>
      </p>
    </div>
  )
}
