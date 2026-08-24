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
import { CollectionTreeNode } from "@/lib/user/collection-queries"
import { formatCompactNumber } from "@/utils/format"

interface CollectionPickerTreeProps {
  nodes: CollectionTreeNode[]
  selectedIds: Set<string>
  alreadyAddedIds: Set<string>
  forceExpandIds: Set<string>
  onToggle: (node: CollectionTreeNode) => void
  depth?: number
}

export function CollectionPickerTree({
  nodes,
  selectedIds,
  alreadyAddedIds,
  forceExpandIds,
  onToggle,
  depth = 0,
}: CollectionPickerTreeProps) {
  if (nodes.length === 0) return null

  return (
    <div
      role={depth === 0 ? "tree" : "group"}
      aria-label={depth === 0 ? "Collections" : undefined}
    >
      {nodes.map((node) => (
        <CollectionPickerRow
          key={node.id}
          node={node}
          depth={depth}
          selectedIds={selectedIds}
          alreadyAddedIds={alreadyAddedIds}
          forceExpandIds={forceExpandIds}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

function CollectionPickerRow({
  node,
  depth,
  selectedIds,
  alreadyAddedIds,
  forceExpandIds,
  onToggle,
}: {
  node: CollectionTreeNode
  depth: number
  selectedIds: Set<string>
  alreadyAddedIds: Set<string>
  forceExpandIds: Set<string>
  onToggle: (node: CollectionTreeNode) => void
}) {
  const hasChildren = node.children.length > 0
  const forceExpanded = forceExpandIds.has(node.id)

  const [expanded, setExpanded] = useState(depth === 0 || forceExpanded)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (forceExpanded) setExpanded(true)
  }, [forceExpanded])

  const alreadyAdded = alreadyAddedIds.has(node.id)
  const selected = selectedIds.has(node.id)

  return (
    <div role="tree-item" aria-expanded={hasChildren ? expanded : undefined}>
      <div
        className="group flex items-center gap-2 rounded-md py-2 pr-2 hover:bg-muted/40"
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

        <Checkbox
          id={`collection-picker-${node.id}`}
          checked={alreadyAdded ? true : selected}
          disabled={alreadyAdded}
          onCheckedChange={() => onToggle(node)}
          aria-label={
            alreadyAdded ? `${node.name}, already added` : `Select ${node.name}`
          }
        />

        <button
          type="button"
          onClick={() => !alreadyAdded && onToggle(node)}
          disabled={alreadyAdded}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded text-left text-sm",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            alreadyAdded && "cursor-default"
          )}
        >
          <HugeiconsIcon
            icon={expanded && hasChildren ? FolderOpenIcon : Folder01Icon}
            size={18}
            color="currentColor"
            strokeWidth={2}
            className="shrink-0 text-primary"
          />
          <span className="truncate font-medium text-foreground">
            {node.name}
          </span>
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
            {formatCompactNumber(node.stats.noteCount)}{" "}
            {node.stats.noteCount === 1 ? "note" : "notes"}
          </span>
        </button>

        {alreadyAdded && (
          <Badge variant="secondary" className="shrink-0 text-xs">
            Already added
          </Badge>
        )}
      </div>

      {hasChildren && expanded ? (
        <CollectionPickerTree
          nodes={node.children}
          depth={depth + 1}
          selectedIds={selectedIds}
          alreadyAddedIds={alreadyAddedIds}
          forceExpandIds={forceExpandIds}
          onToggle={onToggle}
        />
      ) : null}
    </div>
  )
}
