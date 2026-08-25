/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import type { Route } from "next"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Edit02Icon,
  File01Icon,
  Folder01Icon,
  FolderAddIcon,
  FolderOpenIcon,
  Globe02Icon,
  IncognitoIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useModal } from "@/hooks/use-modal-store"
import { notifyShareResult, useWebShare } from "@/hooks/use-web-share"
import { getCollectionOverview } from "@/lib/user/collections"
import type {
  CollectionChildSummary,
  CollectionNotePreview,
  CollectionOverview,
} from "@/lib/user/collection-queries"
import { buildCollectionShareUrl } from "@/lib/user/collection-share"
import { useOrigin } from "@/hooks/use-origin"
import { APP_NAME } from "@/constants/app.constants"
import { formatCompactNumber } from "@/utils/format"
import { formatRelativeTime } from "@/utils/format-date"
import { cn } from "@/lib/utils"

/** One step of the in-dialog drill-down history. */
type Crumb = { id: string; name: string }

const NOTE_PREVIEW_LIMIT = 6

/**
 * A section label, a hairline that runs to the end of the row, and a count.
 * The rule is doing the work a box would otherwise do — this theme is
 * monochrome, so structure has to come from type and line weight.
 */
function SectionHeading({
  label,
  count,
}: {
  label: string
  count?: number | string
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h3 className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </h3>
      <span aria-hidden className="h-px flex-1 bg-border" />
      {count !== undefined && (
        <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
          {count}
        </span>
      )}
    </div>
  )
}

function StatGrid({ overview }: { overview: CollectionOverview }) {
  const cells = [
    { label: "Notes", value: overview.stats.noteCount },
    { label: "Subcollections", value: overview.children.length },
    { label: "Views", value: overview.rollup.viewCount },
    { label: "Downloads", value: overview.rollup.downloadCount },
  ]

  return (
    <>
      {/* gap-px over a border-coloured background: hairlines in both axes
          without fighting `divide-x` when the grid wraps to two columns. */}
      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.label} className="bg-popover px-4 py-3">
            <dd className="text-xl leading-none font-semibold tabular-nums">
              {formatCompactNumber(cell.value)}
            </dd>
            <dt className="mt-1.5 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
              {cell.label}
            </dt>
          </div>
        ))}
      </dl>

      {overview.descendantCount > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Views and downloads include the{" "}
          {formatCompactNumber(overview.descendantCount)} nested collection
          {overview.descendantCount === 1 ? "" : "s"} below this one.
        </p>
      )}
    </>
  )
}

function ChildRow({
  child,
  onOpen,
}: {
  child: CollectionChildSummary
  onOpen: () => void
}) {
  const meta = [
    `${child.stats.noteCount} ${child.stats.noteCount === 1 ? "note" : "notes"}`,
    child.childCount > 0 ? `${child.childCount} inside` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:border-border hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <HugeiconsIcon
          icon={child.childCount > 0 ? FolderOpenIcon : Folder01Icon}
          size={18}
          color="currentColor"
          strokeWidth={2}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{child.name}</span>
          <HugeiconsIcon
            icon={child.visibility === "PUBLIC" ? Globe02Icon : IncognitoIcon}
            size={13}
            color="currentColor"
            strokeWidth={2}
            className="shrink-0 text-muted-foreground"
          />
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {meta}
        </span>
      </span>

      <HugeiconsIcon
        icon={ArrowRight01Icon}
        size={16}
        color="currentColor"
        strokeWidth={2}
        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
      />
    </button>
  )
}

function NoteRow({ note }: { note: CollectionNotePreview }) {
  const meta = [
    note.subject,
    note.pageCount ? `${note.pageCount} pages` : null,
    `${formatCompactNumber(note.viewCount)} views`,
  ]
    .filter(Boolean)
    .join(" · ")

  const body = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <HugeiconsIcon
          icon={File01Icon}
          size={18}
          color="currentColor"
          strokeWidth={2}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{note.title}</span>
          {note.status !== "PUBLISHED" && (
            <Badge variant="outline" className="shrink-0 capitalize">
              {note.status.toLowerCase().replace(/_/g, " ")}
            </Badge>
          )}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {meta}
        </span>
      </span>
    </>
  )

  // Only a published note has a page to open — a draft's public URL 404s, so
  // it stays a plain row with its status on show instead of a broken link.
  if (note.status !== "PUBLISHED") {
    return (
      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
        {body}
      </div>
    )
  }

  return (
    <Link
      href={`/notes/${note.slug}` as Route}
      className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {body}
      <HugeiconsIcon
        icon={ArrowUpRight01Icon}
        size={16}
        color="currentColor"
        strokeWidth={2}
        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
      />
    </Link>
  )
}

function OverviewSkeleton({ name }: { name?: string }) {
  return (
    <div className="px-6 pt-5 pb-6">
      {/* The dialog still needs an accessible name while the fetch is in
          flight, and the clicked card already told us what it is. */}
      <DialogTitle className="sr-only">{name ?? "Collection"}</DialogTitle>
      <div className="flex items-start gap-4">
        <Skeleton className="size-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <Skeleton className="mt-5 h-[70px] w-full rounded-lg" />
      <div className="mt-6 space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function CollectionDetailsDialog() {
  const { close, isOpen, type, data, open } = useModal()
  const isModalOpen = isOpen && type === "collection-details"

  const seed = data.collectionDetails
  const origin = useOrigin()
  const { canShareLink, share } = useWebShare()

  const [trail, setTrail] = useState<Crumb[]>([])
  const [overview, setOverview] = useState<CollectionOverview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, startLoading] = useTransition()

  /**
   * Per-opening cache, so stepping back up the trail is instant. Cleared when
   * the dialog closes rather than kept around: an edit, move, or duplicate
   * between openings would leave these entries wrong.
   */
  const cache = useRef(new Map<string, CollectionOverview>())

  const activeId = trail.length > 0 ? trail[trail.length - 1].id : null

  // Start the trail at whichever collection was clicked, and drop everything on
  // close so the next opening doesn't inherit the last drill-down.
  useEffect(() => {
    if (isModalOpen && seed) {
      setTrail([{ id: seed.id, name: seed.name }])
      return
    }
    if (!isModalOpen) {
      setTrail([])
      setOverview(null)
      setError(null)
      cache.current.clear()
    }
  }, [isModalOpen, seed?.id, seed?.name])

  useEffect(() => {
    if (!isModalOpen || !activeId) return

    const cached = cache.current.get(activeId)
    if (cached) {
      setOverview(cached)
      setError(null)
      return
    }

    let cancelled = false
    setOverview(null)
    setError(null)

    startLoading(async () => {
      const result = await getCollectionOverview({
        collectionId: activeId,
        noteLimit: NOTE_PREVIEW_LIMIT,
      })
      if (cancelled) return
      if (!result.ok) {
        setError(result.error)
        return
      }
      cache.current.set(activeId, result.data)
      setOverview(result.data)
    })

    return () => {
      cancelled = true
    }
  }, [isModalOpen, activeId])

  const collection = overview?.collection
  const isPublic = collection?.visibility === "PUBLIC"
  const shareUrl =
    origin && collection ? buildCollectionShareUrl(origin, collection) : ""

  function handleDeviceShare() {
    if (!collection || !shareUrl) return
    startLoading(async () => {
      const result = await share({
        url: shareUrl,
        title: collection.name,
        text:
          collection.description ||
          `A collection of study notes on ${APP_NAME}.`,
      })
      notifyShareResult(result, { failed: "Couldn't share this collection" })
    })
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(openState) => {
        if (!openState) close()
      }}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {/* The trail is both breadcrumb and history: every collection opened
            from inside the dialog appends a step, and each step goes back. */}
        <nav
          aria-label="Collection trail"
          className="flex items-center gap-1 overflow-x-auto border-b border-border px-4 py-2.5 pr-14"
        >
          {trail.length > 1 && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Back to previous collection"
              className="mr-1 shrink-0"
              onClick={() => setTrail((prev) => prev.slice(0, -1))}
            >
              <HugeiconsIcon
                icon={ArrowLeft02Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
              />
            </Button>
          )}

          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1
            return (
              <span key={`${crumb.id}-${index}`} className="flex items-center">
                {index > 0 && (
                  <span
                    aria-hidden
                    className="px-1 text-xs text-muted-foreground/60"
                  >
                    /
                  </span>
                )}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="max-w-[16ch] truncate text-xs font-medium sm:max-w-[28ch]"
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTrail((prev) => prev.slice(0, index + 1))}
                    className="max-w-[12ch] truncate rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:max-w-[20ch]"
                  >
                    {crumb.name}
                  </button>
                )}
              </span>
            )
          })}
        </nav>

        <div className="max-h-[62vh] overflow-y-auto">
          {error ? (
            <div className="px-6 py-10 text-center">
              <DialogTitle className="text-base">
                Collection unavailable
              </DialogTitle>
              <DialogDescription className="mt-1">{error}</DialogDescription>
            </div>
          ) : !overview || !collection ? (
            <OverviewSkeleton
              name={trail.length > 0 ? trail[trail.length - 1].name : undefined}
            />
          ) : (
            <>
              <DialogHeader className="px-6 pt-5 pb-6">
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <HugeiconsIcon
                      icon={
                        overview.children.length > 0
                          ? FolderOpenIcon
                          : Folder01Icon
                      }
                      size={24}
                      color="currentColor"
                      strokeWidth={2}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <DialogTitle className="text-xl tracking-tight">
                        {collection.name}
                      </DialogTitle>
                      <Badge
                        variant={isPublic ? "secondary" : "outline"}
                        className="gap-1"
                      >
                        <HugeiconsIcon
                          icon={isPublic ? Globe02Icon : IncognitoIcon}
                          size={12}
                          color="currentColor"
                          strokeWidth={2}
                        />
                        {isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>

                    <DialogDescription className="mt-1.5">
                      {collection.description ||
                        `Updated ${formatRelativeTime(new Date(collection.updatedAt))}.`}
                    </DialogDescription>

                    {collection.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Updated{" "}
                        {formatRelativeTime(new Date(collection.updatedAt))}
                      </p>
                    )}
                  </div>
                </div>

                <StatGrid overview={overview} />
              </DialogHeader>

              <div className="space-y-6 border-t border-border px-6 py-5">
                <section>
                  <SectionHeading
                    label="Subcollections"
                    count={overview.children.length}
                  />

                  {overview.children.length === 0 ? (
                    <p className="px-3 text-sm text-muted-foreground">
                      Nothing nested here yet. Subcollections are how a semester
                      splits into subjects.
                    </p>
                  ) : (
                    <div className="-mx-1 space-y-0.5">
                      {overview.children.map((child) => (
                        <ChildRow
                          key={child.id}
                          child={child}
                          onOpen={() =>
                            setTrail((prev) => [
                              ...prev,
                              { id: child.id, name: child.name },
                            ])
                          }
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <SectionHeading
                    label="Notes"
                    count={overview.stats.noteCount}
                  />

                  {overview.notes.length === 0 ? (
                    <p className="px-3 text-sm text-muted-foreground">
                      No notes in this collection yet.
                    </p>
                  ) : (
                    <div className="-mx-1 space-y-0.5">
                      {overview.notes.map((note) => (
                        <NoteRow key={note.id} note={note} />
                      ))}

                      {overview.stats.noteCount > overview.notes.length && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 w-full justify-start text-muted-foreground"
                          render={
                            <Link
                              href={
                                `/profile/collections/${collection.slug}` as Route
                              }
                              onClick={() => close()}
                            />
                          }
                        >
                          Show all {overview.stats.noteCount} notes
                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            size={14}
                            color="currentColor"
                            strokeWidth={2}
                          />
                        </Button>
                      )}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </div>

        <div
          className={cn(
            "flex flex-col-reverse gap-2 border-t border-border bg-muted/30 px-4 py-3",
            "sm:flex-row sm:items-center sm:justify-between"
          )}
        >
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={!collection}
              onClick={() =>
                collection &&
                open("create-collection", {
                  collectionFormDialog: {
                    fixedParentId: collection.id,
                    fixedParentName: collection.name,
                  },
                })
              }
            >
              <HugeiconsIcon
                icon={FolderAddIcon}
                size={16}
                color="currentColor"
                strokeWidth={2}
              />
              Subcollection
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={!collection}
              onClick={() =>
                collection &&
                open("edit-collection", {
                  editCollection: {
                    id: collection.id,
                    name: collection.name,
                    description: collection.description,
                    visibility: collection.visibility,
                  },
                })
              }
            >
              <HugeiconsIcon
                icon={Edit02Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
              />
              Edit
            </Button>

            {/* Straight to the OS share sheet. Only shown where the browser
                actually has one and the link resolves for other people. */}
            {canShareLink && isPublic && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Share ${collection?.name ?? "collection"} via your device`}
                title="Share via device"
                disabled={!shareUrl || isLoading}
                onClick={handleDeviceShare}
              >
                <HugeiconsIcon
                  icon={Share08Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              disabled={!collection}
              onClick={() =>
                collection &&
                open("share-collection", {
                  shareCollection: {
                    id: collection.id,
                    slug: collection.slug,
                    name: collection.name,
                    description: collection.description,
                    visibility: collection.visibility,
                  },
                })
              }
            >
              <HugeiconsIcon
                icon={Share08Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
              />
              Link &amp; QR
            </Button>
          </div>

          <Button
            size="sm"
            disabled={!collection}
            render={
              collection ? (
                <Link
                  href={`/profile/collections/${collection.slug}` as Route}
                  onClick={() => close()}
                />
              ) : undefined
            }
          >
            Open collection
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
