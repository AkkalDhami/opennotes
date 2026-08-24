"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Folder01Icon,
  FolderOpenIcon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  Download01Icon,
  ViewIcon,
  File01Icon,
} from "@hugeicons/core-free-icons"
import { CollectionTreeNode } from "@/lib/user/collection-queries"
import { Route } from "next"
import { CollectionActionsMenu } from "./collection-actions-menu"
import { formatCompactNumber } from "@/utils/format"
import { formatDate } from "@/utils/format-date"

export function CollectionRow({
  node,
  depth,
  siblingCount,
  siblingIndex,
}: {
  node: CollectionTreeNode
  depth: number
  siblingCount: number
  siblingIndex: number
}) {
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = node.children.length > 0

  return (
    <div role="tree-item" aria-expanded={hasChildren ? expanded : undefined}>
      <div
        className="group flex gap-2 px-4 py-3 hover:bg-muted/40"
        style={{ paddingLeft: `${16 + depth * 24}px` }}
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

        <HugeiconsIcon
          icon={expanded && hasChildren ? FolderOpenIcon : Folder01Icon}
          size={20}
          color="currentColor"
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-primary"
        />

        <Link
          href={`/profile/collections/${node.slug}` as Route}
          className="min-w-0 flex-1 rounded focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="truncate font-medium text-foreground">
              {node.name}
            </span>
            <span className="text-xs text-muted-foreground">
              Updated {formatDate(node.updatedAt)}
            </span>
          </div>
          {node.description ? (
            <p className="truncate text-sm text-muted-foreground">
              {node.description}
            </p>
          ) : null}
        </Link>

        <div className="hidden shrink-0 items-center gap-3 text-xs text-muted-foreground sm:flex">
          <span className="flex items-center gap-1">
            <HugeiconsIcon
              icon={File01Icon}
              size={14}
              color="currentColor"
              strokeWidth={2}
            />
            {formatCompactNumber(node.stats.noteCount)}
          </span>
          <span className="flex items-center gap-1">
            <HugeiconsIcon
              icon={Download01Icon}
              size={14}
              color="currentColor"
              strokeWidth={2}
            />
            {formatCompactNumber(node.stats.downloadCount)}
          </span>
          <span className="flex items-center gap-1">
            <HugeiconsIcon
              icon={ViewIcon}
              size={14}
              color="currentColor"
              strokeWidth={2}
            />
            {formatCompactNumber(node.stats.viewCount)}
          </span>
        </div>

        <CollectionActionsMenu
          collection={node}
          siblingCount={siblingCount}
          siblingIndex={siblingIndex}
        />
      </div>

      {hasChildren && expanded ? (
        <div>
          {node.children.map((child, index) => (
            <CollectionRow
              key={child.id}
              node={child}
              depth={depth + 1}
              siblingCount={node.children.length}
              siblingIndex={index}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
