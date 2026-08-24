import { NoteCard } from "@/components/notes/note-card"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { CreateCollectionButton } from "@/components/user/collections/create-collection-button"
import { DeleteCollectionButton } from "@/components/user/collections/delete-collection-butto"
import { EditCollectionButton } from "@/components/user/collections/edit-collection-button"
import { APP_NAME } from "@/constants/app.constants"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import {
  getChildCollections,
  getCollectionByOwnerAndSlug,
  getCollectionNotes,
} from "@/lib/user/collection-queries"
import { formatCompactNumber } from "@/utils/format"
import {
  ArrowLeft01Icon,
  Download01Icon,
  File01Icon,
  Folder01Icon,
  Share08Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Metadata, Route } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "My Collections",
  description: `Create, organize, and manage your notes with collections on ${APP_NAME}.`,
}

export default async function page(
  props: PageProps<"/profile/collections/[slug]">
) {
  const slug = (await props.params).slug

  const user = await getCurrentUser()
  if (!user) redirect("/signin")

  const collection = await getCollectionByOwnerAndSlug(user.id, slug)
  if (!collection) redirect("/profile/collections")

  const [children, notes] = await Promise.all([
    getChildCollections(collection.id),
    getCollectionNotes(collection.id),
  ])

  const noteCount = notes.length
  const downloadCount = notes.reduce(
    (sum, n) =>
      sum +
      (("downloadCount" in n
        ? (n as { downloadCount?: number }).downloadCount
        : 0) ?? 0),
    0
  )
  const viewCount = notes.reduce(
    (sum, n) =>
      sum +
      (("viewCount" in n ? (n as { viewCount?: number }).viewCount : 0) ?? 0),
    0
  )

  return (
    <DashboardContainer>
      <Button
        variant="secondary"
        size="sm"
        nativeButton={false}
        className="w-fit"
        render={
          <Link href="/profile/collections">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={16}
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />
            My Collections
          </Link>
        }
      ></Button>

      <PageHeader
        title={collection.name}
        description={collection.description ?? undefined}
      />
      <div className="flex gap-2">
        <CreateCollectionButton
          label="Create Subcollection"
          data={{
            fixedParentId: collection.id,
            fixedParentName: collection.name,
          }}
        />
        <EditCollectionButton collection={collection} />
        <Button variant="outline">
          <HugeiconsIcon
            icon={Share08Icon}
            size={18}
            color="currentColor"
            strokeWidth={2}
          />
          Share
        </Button>
        <DeleteCollectionButton
          data={{
            id: collection.id,
            name: collection.name,
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon
            icon={File01Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          {formatCompactNumber(noteCount)} Notes
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
      </div>

      {children.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Subcollections
          </h2>
          <div className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/profile/collections/${child.slug}` as Route}
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
                  {child.description ? (
                    <div className="truncate text-sm text-muted-foreground">
                      {child.description}
                    </div>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatCompactNumber(child.stats.noteCount)} Notes
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Notes
        </h2>
        {notes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No notes in this collection yet.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>
    </DashboardContainer>
  )
}
