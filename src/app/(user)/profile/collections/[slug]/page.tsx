import type { ReactNode } from "react"
import { Metadata, Route } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Folder01Icon,
  FolderOpenIcon,
  Globe02Icon,
  IncognitoIcon,
} from "@hugeicons/core-free-icons"

import { NoteCard } from "@/components/notes/note-card"
import { Badge } from "@/components/ui/badge"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { AddNotesButton } from "@/components/user/collections/add-notes-button"
import { CollectionChildList } from "@/components/user/collections/collection-child-list"
import { CollectionDetailActions } from "@/components/user/collections/collection-detail-actions"
import { APP_NAME } from "@/constants/app.constants"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import {
  getCollectionNotes,
  getOwnerCollectionOverview,
} from "@/lib/user/collection-queries"
import { formatCompactNumber } from "@/utils/format"
import { formatRelativeTime } from "@/utils/format-date"

export const metadata: Metadata = {
  title: "My Collections",
  description: `Create, organize, and manage your notes with collections on ${APP_NAME}.`,
}

/** A section label with a rule that runs to the end of the row. */
function SectionHeading({
  label,
  count,
  action,
}: {
  label: string
  count?: number
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </h2>
      {count !== undefined && (
        <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
          {formatCompactNumber(count)}
        </span>
      )}
      <span aria-hidden className="h-px flex-1 bg-border" />
      {action}
    </div>
  )
}

export default async function page(
  props: PageProps<"/profile/collections/[slug]">
) {
  const slug = (await props.params).slug

  const user = await getCurrentUser()
  if (!user) redirect("/signin")

  const overview = await getOwnerCollectionOverview({
    ownerId: user.id,
    slug,
    // The page lists every note itself; this only affects the unused preview
    // array, so keep it small.
    noteLimit: 1,
  })
  if (!overview) redirect("/profile/collections")

  const { collection, ancestors, children, stats, rollup, descendantCount } =
    overview

  const notes = await getCollectionNotes(collection.id)
  const isPublic = collection.visibility === "PUBLIC"

  const figures = [
    { label: "Notes", value: stats.noteCount },
    { label: "Subcollections", value: children.length },
    { label: "Views", value: rollup.viewCount },
    { label: "Downloads", value: rollup.downloadCount },
  ]

  return (
    <DashboardContainer>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 overflow-x-auto text-xs text-muted-foreground"
      >
        <Link
          href="/profile/collections"
          className="flex shrink-0 items-center gap-1 rounded transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={14}
            color="currentColor"
            strokeWidth={2}
          />
          Collections
        </Link>

        {ancestors.map((ancestor) => (
          <span key={ancestor.id} className="flex items-center">
            <span aria-hidden className="px-1.5 text-muted-foreground/50">
              /
            </span>
            <Link
              href={`/profile/collections/${ancestor.slug}` as Route}
              className="max-w-[14ch] truncate rounded transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:max-w-[24ch]"
            >
              {ancestor.name}
            </Link>
          </span>
        ))}

        <span aria-hidden className="px-1.5 text-muted-foreground/50">
          /
        </span>
        <span
          aria-current="page"
          className="max-w-[16ch] truncate font-medium text-foreground sm:max-w-[32ch]"
        >
          {collection.name}
        </span>
      </nav>

      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="relative shrink-0">
            {children.length > 0 && (
              <span
                aria-hidden
                className="absolute top-1.5 left-1.5 size-12 rounded-xl border border-border sm:size-14"
              />
            )}
            <span className="relative flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14">
              <HugeiconsIcon
                icon={children.length > 0 ? FolderOpenIcon : Folder01Icon}
                size={26}
                color="currentColor"
                strokeWidth={2}
              />
            </span>
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading truncate text-2xl font-medium tracking-tight sm:text-3xl">
                {collection.name}
              </h1>
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

            {collection.description && (
              <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                {collection.description}
              </p>
            )}

            <p className="mt-2 text-xs text-muted-foreground">
              Updated {formatRelativeTime(new Date(collection.updatedAt))}
              {descendantCount > 0 && (
                <>
                  {" · "}
                  {formatCompactNumber(descendantCount)} nested collection
                  {descendantCount === 1 ? "" : "s"}
                </>
              )}
            </p>
          </div>
        </div>

        <CollectionDetailActions collection={collection} />
      </header>

      <dl className="grid grid-cols-2 overflow-hidden rounded-lg sm:grid-cols-4">
        {figures.map((figure) => (
          <div key={figure.label} className="bg-card px-4 py-3.5">
            <dd className="text-2xl leading-none font-semibold tabular-nums">
              {formatCompactNumber(figure.value)}
            </dd>
            <dt className="mt-2 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
              {figure.label}
            </dt>
          </div>
        ))}
      </dl>

      {descendantCount > 0 && (
        <p className="-mt-3 text-xs text-muted-foreground">
          Views and downloads include everything nested below this collection.
        </p>
      )}

      {children.length > 0 && (
        <section>
          <SectionHeading label="Subcollections" count={children.length} />
          <CollectionChildList items={children} />
        </section>
      )}

      <section>
        <SectionHeading
          label="Notes"
          count={notes.length}
          action={
            <AddNotesButton
              collectionId={collection.id}
              collectionName={collection.name}
            />
          }
        />

        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm font-medium">No notes in here yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Add notes you&apos;ve uploaded or saved, and they&apos;ll show up
              here for anyone browsing this collection.
            </p>
            <div className="mt-4 flex justify-center">
              <AddNotesButton
                collectionId={collection.id}
                collectionName={collection.name}
                variant="default"
                label="Add your first note"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>
    </DashboardContainer>
  )
}
