"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Folder01Icon,
  FolderOpenIcon,
  ArrowRight01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCompactNumber } from "@/utils/format"

/**
 * The minimum shape the tree needs to render a row. Kept structural rather than
 * tied to `CollectionTreeNode` so the same component can render the lightweight
 * `{id, name}` option trees the parent pickers build — `stats` is optional and
 * the note count is simply omitted when absent.
 */
export type PickerCollectionNode = {
  id: string
  name: string
  description?: string | null
  stats?: { noteCount: number }
  children: PickerCollectionNode[]
}

interface CollectionPickerTreeProps<T extends PickerCollectionNode> {
  nodes: T[]
  selectedIds: Set<string>
  /** Disabled and shown as already-checked, with an explanatory badge. */
  alreadyAddedIds?: Set<string>
  /** Disabled and shown unchecked — an invalid target rather than a done one. */
  disabledIds?: Set<string>
  forceExpandIds: Set<string>
  onToggle: (node: T) => void
  alreadyAddedLabel?: string
  disabledLabel?: string
  /**
   * "single" swaps the checkbox for a radio dot. Selection itself is still owned
   * by the parent — this only changes the affordance.
   */
  selectionMode?: "single" | "multiple"
  depth?: number
}

export function CollectionPickerTree<T extends PickerCollectionNode>({
  nodes,
  selectedIds,
  alreadyAddedIds,
  disabledIds,
  forceExpandIds,
  onToggle,
  alreadyAddedLabel = "Already added",
  disabledLabel,
  selectionMode = "multiple",
  depth = 0,
}: CollectionPickerTreeProps<T>) {
  if (nodes.length === 0) return null

  return (
    <div
      role={depth === 0 ? "tree" : "group"}
      aria-label={depth === 0 ? "Collections" : undefined}
      aria-multiselectable={
        depth === 0 ? selectionMode === "multiple" : undefined
      }
    >
      {nodes.map((node) => (
        <CollectionPickerRow
          key={node.id}
          node={node}
          depth={depth}
          selectedIds={selectedIds}
          alreadyAddedIds={alreadyAddedIds}
          disabledIds={disabledIds}
          forceExpandIds={forceExpandIds}
          onToggle={onToggle}
          alreadyAddedLabel={alreadyAddedLabel}
          disabledLabel={disabledLabel}
          selectionMode={selectionMode}
        />
      ))}
    </div>
  )
}

function CollectionPickerRow<T extends PickerCollectionNode>({
  node,
  depth,
  selectedIds,
  alreadyAddedIds,
  disabledIds,
  forceExpandIds,
  onToggle,
  alreadyAddedLabel,
  disabledLabel,
  selectionMode,
}: {
  node: T
  depth: number
  selectedIds: Set<string>
  alreadyAddedIds?: Set<string>
  disabledIds?: Set<string>
  forceExpandIds: Set<string>
  onToggle: (node: T) => void
  alreadyAddedLabel: string
  disabledLabel?: string
  selectionMode: "single" | "multiple"
}) {
  const hasChildren = node.children.length > 0
  const forceExpanded = forceExpandIds.has(node.id)

  const [expanded, setExpanded] = useState(depth === 0 || forceExpanded)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (forceExpanded) setExpanded(true)
  }, [forceExpanded])

  const alreadyAdded = alreadyAddedIds?.has(node.id) ?? false
  const blocked = disabledIds?.has(node.id) ?? false
  const disabled = alreadyAdded || blocked
  const selected = selectedIds.has(node.id)
  const checked = alreadyAdded ? true : selected

  const badgeLabel = alreadyAdded
    ? alreadyAddedLabel
    : blocked
      ? disabledLabel
      : undefined

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={disabled ? undefined : selected}
    >
      <div
        className={cn(
          "group flex items-center gap-2 rounded-md py-2 pr-2 hover:bg-muted/40",
          selected && !disabled && "bg-primary/5",
          blocked && "opacity-50"
        )}
        style={{ paddingLeft: `${8 + depth * 20}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={
              expanded ? `Collapse ${node.name}` : `Expand ${node.name}`
            }
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <HugeiconsIcon
              icon={expanded ? ArrowDown01Icon : ArrowRight01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
          </button>
        ) : (
          <span className="h-6 w-6 shrink-0" aria-hidden />
        )}

        {selectionMode === "single" ? (
          <span
            aria-hidden
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded-full border",
              selected ? "border-primary" : "border-input",
              disabled && "border-muted"
            )}
          >
            {selected && <span className="size-2 rounded-full bg-primary" />}
          </span>
        ) : (
          <Checkbox
            id={`collection-picker-${node.id}`}
            checked={checked}
            disabled={disabled}
            onCheckedChange={() => onToggle(node)}
            aria-label={
              alreadyAdded
                ? `${node.name}, ${alreadyAddedLabel.toLowerCase()}`
                : `Select ${node.name}`
            }
          />
        )}

        <button
          type="button"
          onClick={() => !disabled && onToggle(node)}
          disabled={disabled}
          aria-pressed={selectionMode === "single" ? selected : undefined}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded text-left text-sm",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            disabled && "cursor-default"
          )}
        >
          <HugeiconsIcon
            icon={expanded && hasChildren ? FolderOpenIcon : Folder01Icon}
            size={18}
            color="currentColor"
            strokeWidth={2}
            className="shrink-0"
          />
          <span className="truncate font-medium text-foreground">
            {node.name}
          </span>
          {node.stats && (
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
              {formatCompactNumber(node.stats.noteCount)}{" "}
              {node.stats.noteCount === 1 ? "note" : "notes"}
            </span>
          )}
        </button>

        {badgeLabel && (
          <Badge variant="outline" className="shrink-0 text-xs">
            {badgeLabel}
          </Badge>
        )}
      </div>

      {hasChildren && expanded ? (
        <CollectionPickerTree
          nodes={node.children as T[]}
          depth={depth + 1}
          selectedIds={selectedIds}
          alreadyAddedIds={alreadyAddedIds}
          disabledIds={disabledIds}
          forceExpandIds={forceExpandIds}
          onToggle={onToggle}
          alreadyAddedLabel={alreadyAddedLabel}
          disabledLabel={disabledLabel}
          selectionMode={selectionMode}
        />
      ) : null}
    </div>
  )
}
