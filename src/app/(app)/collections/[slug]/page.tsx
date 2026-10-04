import type { Metadata } from "next"
import type { Route } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  Download01Icon,
  File01Icon,
  Folder01Icon,
  FolderLibraryIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons"

import { NoteCard } from "@/components/notes/note-card"
import { buttonVariants } from "@/components/ui/button"
import { APP_NAME } from "@/constants/app.constants"
import { cn } from "@/lib/utils"
import { createMetadata } from "@/lib/seo"
import {
  getCollectionNotes,
  getPublicChildCollections,
  getPublicCollectionAncestors,
  getPublicCollectionByShareSlug,
  getPublicCollectionOwner,
} from "@/lib/user/collection-queries"
import { buildCollectionSharePath } from "@/lib/user/collection-share"
import { formatCompactNumber } from "@/utils/format"
import { formatRelativeTime } from "@/utils/format-date"
import { VerifiedUserAvatar } from "@/components/shared/verified-user-avatar"

type PublicCollectionPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PublicCollectionPageProps): Promise<Metadata> {
  const { slug } = await params
  const collection = await getPublicCollectionByShareSlug(slug)

  if (!collection) {
    return {
      title: "Collection Not Found",
      robots: { index: false, follow: false },
    }
  }

  const owner = await getPublicCollectionOwner(collection.ownerId)
  const ownerName = owner?.name ?? owner?.username ?? "a contributor"

  return createMetadata({
    title: `${collection.name} — ${APP_NAME} Collection`,
    description:
      collection.description ||
      `A collection of study notes and materials curated by ${ownerName} on ${APP_NAME}.`,
    path: buildCollectionSharePath(collection),
  })
}

export default async function page({ params }: PublicCollectionPageProps) {
  const { slug } = await params

  const collection = await getPublicCollectionByShareSlug(slug)
  if (!collection) notFound()

  const [owner, ancestors, children, notes] = await Promise.all([
    getPublicCollectionOwner(collection.ownerId),
    getPublicCollectionAncestors(collection),
    getPublicChildCollections(collection.id),
    // Published notes only. The owner may have pending, rejected, or taken-down
    // notes filed in here and a public page must never surface them.
    getCollectionNotes(collection.id, { publishedOnly: true }),
  ])

  const noteCount = notes.length
  const downloadCount = notes.reduce(
    (sum, n) => sum + (n.downloadCount ?? 0),
    0
  )
  const viewCount = notes.reduce((sum, n) => sum + (n.viewCount ?? 0), 0)

  const ownerLabel = owner?.name ?? owner?.username ?? "A contributor"

  return (
    <>
      <Link
        href={"/notes" as Route}
        className={cn(buttonVariants({ variant: "secondary" }), "w-fit")}
      >
        <HugeiconsIcon
          icon={ArrowLeft02Icon}
          size={22}
          color="currentColor"
          strokeWidth={1.5}
        />{" "}
        Browse Notes
      </Link>

      {ancestors.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
            {ancestors.map((ancestor) => (
              <li key={ancestor.id} className="flex items-center gap-1.5">
                <Link
                  href={buildCollectionSharePath(ancestor) as Route}
                  className="rounded hover:text-foreground hover:underline"
                >
                  {ancestor.name}
                </Link>
                <span aria-hidden="true">/</span>
              </li>
            ))}
            <li aria-current="page" className="text-foreground">
              {collection.name}
            </li>
          </ol>
        </nav>
      )}

      <div className="flex items-start gap-4 sm:items-center">
        <div className="flex size-15 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <HugeiconsIcon
            icon={Folder01Icon}
            size={28}
            color="currentColor"
            strokeWidth={2}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            {collection.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Updated {formatRelativeTime(new Date(collection.updatedAt))}
          </p>
        </div>
        {collection.description && (
          <p className="max-w-2xl text-muted-foreground">
            {collection.description}
          </p>
        )}
      </div>

      {owner && (
        <div className="flex items-center gap-3">
          {/* <Avatar className="size-10 border">
            <AvatarImage
              src={owner.avatarUrl ?? undefined}
              alt={`${ownerLabel}'s avatar`}
            />
            <AvatarFallback>{getInitials(ownerLabel)}</AvatarFallback>
          </Avatar> */}

          <VerifiedUserAvatar
            avatarUrl={owner.avatarUrl}
            displayName={ownerLabel}
          />

          <div className="text-sm">
            <p className="text-muted-foreground">Curated by</p>
            {owner.username ? (
              <Link
                href={`/contributors/${owner.username}` as Route}
                className="text-base font-medium text-foreground hover:underline"
              >
                {ownerLabel}
              </Link>
            ) : (
              <span className="text-base font-medium text-foreground">
                {ownerLabel}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon
            icon={File01Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          {formatCompactNumber(noteCount)} {noteCount === 1 ? "Note" : "Notes"}
        </span>
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon
            icon={Download01Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          {formatCompactNumber(downloadCount)} Downloads
        </span>
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon
            icon={ViewIcon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          {formatCompactNumber(viewCount)} Views
        </span>
        {children.length > 0 && (
          <>
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon
                icon={FolderLibraryIcon}
                size={16}
                color="currentColor"
                strokeWidth={2}
              />
              {children.length}{" "}
              {children.length === 1 ? "Subcollection" : "Subcollections"}
            </span>
          </>
        )}
      </div>

      {children.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-muted-foreground">
            Subcollections
          </h2>
          <div className="divide-y divide-border rounded-lg border bg-card">
            {children.map((child) => (
              <Link
                key={child.id}
                href={buildCollectionSharePath(child) as Route}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40"
              >
                <HugeiconsIcon
                  icon={Folder01Icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={2}
                  className="text-primary"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{child.name}</div>
                  {child.description && (
                    <div className="truncate text-sm text-muted-foreground">
                      {child.description}
                    </div>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatCompactNumber(child.stats.noteCount)} Notes
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-muted-foreground">Notes</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This collection doesn&apos;t have any published notes yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
