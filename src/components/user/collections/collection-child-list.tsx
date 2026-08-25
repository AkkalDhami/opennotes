"use client"

import Link from "next/link"
import type { Route } from "next"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRight01Icon,
  Folder01Icon,
  FolderOpenIcon,
  Globe02Icon,
  IncognitoIcon,
} from "@hugeicons/core-free-icons"

import { useModal } from "@/hooks/use-modal-store"
import type { CollectionChildSummary } from "@/lib/user/collection-queries"
import { formatCompactNumber } from "@/utils/format"
import { CollectionActionsMenu } from "./collection-actions-menu"

/**
 * Subcollections on a collection's own page.
 *
 * Clicking a row opens the details dialog, the same as a card in the library
 * grid, so one interaction works everywhere. The arrow beside it is the escape
 * hatch to the full page for people who'd rather navigate.
 */
export function CollectionChildList({
  items,
}: {
  items: CollectionChildSummary[]
}) {
  const { open } = useModal()

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
      {items.map((child, index) => {
        const isPublic = child.visibility === "PUBLIC"

        return (
          <li
            key={child.id}
            className="group flex items-center gap-2 px-3 py-2.5 transition-colors hover:bg-muted/40"
          >
            <button
              type="button"
              onClick={() =>
                open("collection-details", {
                  collectionDetails: { id: child.id, name: child.name },
                })
              }
              className="flex min-w-0 flex-1 items-center gap-3 rounded text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground/70 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <HugeiconsIcon
                  icon={child.childCount > 0 ? FolderOpenIcon : Folder01Icon}
                  size={18}
                  color="currentColor"
                  strokeWidth={2}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">
                    {child.name}
                  </span>
                  <HugeiconsIcon
                    icon={isPublic ? Globe02Icon : IncognitoIcon}
                    size={13}
                    color="currentColor"
                    strokeWidth={2}
                    className="shrink-0 text-muted-foreground"
                    aria-label={isPublic ? "Public" : "Private"}
                  />
                </span>

                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {child.description ||
                    [
                      `${formatCompactNumber(child.stats.noteCount)} ${
                        child.stats.noteCount === 1 ? "note" : "notes"
                      }`,
                      child.childCount > 0
                        ? `${child.childCount} inside`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                </span>
              </span>
            </button>

            <span className="hidden w-20 shrink-0 justify-end text-xs text-muted-foreground tabular-nums sm:flex">
              {formatCompactNumber(child.stats.noteCount)}{" "}
              {child.stats.noteCount === 1 ? "note" : "notes"}
            </span>

            <Link
              href={`/profile/collections/${child.slug}` as Route}
              aria-label={`Open ${child.name} page`}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
              />
            </Link>

            <CollectionActionsMenu
              collection={child}
              siblingCount={items.length}
              siblingIndex={index}
            />
          </li>
        )
      })}
    </ul>
  )
}
