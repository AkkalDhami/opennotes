import type { Metadata, Route } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Folder01Icon,
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { CollectionCard } from "@/components/collections/collection-card"
import { CollectionSaveButton } from "@/components/collections/collection-save-button"
import { CollectionShareDialog } from "@/components/collections/collection-share-dialog"
import {
  getPublicBreadcrumbs,
  getPublicCollectionBySlug,
  getPublicCollectionNotes,
  getPublicSubcollections,
  getRelatedPublicCollections,
  isCollectionSaved,
} from "@/lib/collections/collections-queries"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import Image from "next/image"

type Params = { params: Promise<{ username: string; slug: string }> }
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://opennotes.com"

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username, slug } = await params
  const c = await getPublicCollectionBySlug(username, slug)
  if (!c)
    return {
      title: "Collection not found",
      robots: { index: false, follow: false },
    }
  const url = `${BASE}/collections/${username}/${slug}`
  const description =
    c.description ??
    `A collection of ${c.noteCount} notes organized by ${c.creator.name} on OpenNotes.`
  return {
    title: `${c.name} — Collection by ${c.creator.name}`,
    description,
    alternates: { canonical: url },
    openGraph: { title: c.name, description, url, type: "website" },
    twitter: { card: "summary", title: c.name, description },
  }
}

export default async function CollectionPage({ params }: Params) {
  const { username, slug } = await params
  const c = await getPublicCollectionBySlug(username, slug)
  if (!c) notFound()
  const user = await getCurrentUser()
  const [subs, noteList, trail, related, saved] = await Promise.all([
    getPublicSubcollections(c.id),
    getPublicCollectionNotes(c.id),
    getPublicBreadcrumbs(c.parentId),
    getRelatedPublicCollections(c),
    isCollectionSaved(user?.id, c.id),
  ])
  const url = `${BASE}/collections/${username}/${slug}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Collections",
        item: `${BASE}/collections`,
      },
      ...trail.map((t, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: t.name,
        item: `${BASE}/collections/${t.username}/${t.slug}`,
      })),
      {
        "@type": "ListItem",
        position: trail.length + 2,
        name: c.name,
        item: url,
      },
    ],
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Button
        variant="ghost"
        nativeButton={false}
        className="-ml-3 gap-1 text-muted-foreground"
        render={
          <Link href={"/collections" as Route}>
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
            />
            Collections
          </Link>
        }
      />
      {trail.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="mt-2 text-sm text-muted-foreground"
        >
          {trail.map((t) => (
            <span key={t.slug}>
              <Link
                href={`/collections/${t.username}/${t.slug}` as Route}
                className="hover:underline"
              >
                {t.name}
              </Link>{" "}
              /{" "}
            </span>
          ))}
          <span aria-current="page" className="text-foreground">
            {c.name}
          </span>
        </nav>
      )}

      <header className="mt-6 space-y-6 border-b pb-10">
        <HugeiconsIcon
          icon={Folder01Icon}
          size={28}
          color="currentColor"
          strokeWidth={1.5}
          className="size-7 text-muted-foreground"
        />
        <div className="max-w-2xl space-y-3">
          <h1 className="font-serif text-4xl tracking-tight md:text-5xl">
            {c.name}
          </h1>
          {c.description && (
            <p className="text-lg text-muted-foreground">{c.description}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Organized by
          </p>
          <Link
            href={`/contributors/${c.creator.username}`}
            className="-m-1 inline-flex items-center gap-3 rounded-lg p-1 hover:bg-muted/60"
          >
            {c.creator.avatarUrl ? (
              <Image
                src={c.creator.avatarUrl}
                alt={c.creator.name}
                width={36}
                height={36}
                className="size-9 rounded-full object-cover"
              />
            ) : (
              <span className="size-9 rounded-full bg-muted" />
            )}
            <span className="leading-tight">
              <span className="flex items-center gap-1 font-medium">
                {c.creator.name}
                {c.creator.isVerified && (
                  <HugeiconsIcon
                    icon={CheckmarkBadge01Icon}
                    size={14}
                    color="currentColor"
                    strokeWidth={2}
                    className="size-3.5 text-primary"
                    aria-label="Verified"
                  />
                )}
              </span>
              <span className="text-sm text-muted-foreground">
                @{c.creator.username}
              </span>
            </span>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          {c.noteCount} Notes · {c.downloads} Downloads · {c.views} Views ·{" "}
          {c.saves} Saves
        </p>
        <div className="flex flex-wrap gap-3">
          <CollectionSaveButton collectionId={c.id} initialSaved={saved} />
          <CollectionShareDialog name={c.name} url={url} />
        </div>
      </header>

      {subs.length > 0 && (
        <section className="mt-10 space-y-3">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Subcollections
          </h2>
          {subs.map((s) => (
            <Link
              key={s.id}
              href={`/collections/${s.ownerUsername}/${s.slug}` as Route}
              className="group flex items-center gap-3 rounded-xl border p-4 transition-colors hover:border-foreground/25"
            >
              <HugeiconsIcon
                icon={Folder01Icon}
                size={18}
                color="currentColor"
                strokeWidth={1.75}
                className="size-4.5 text-muted-foreground"
              />
              <span className="flex-1">
                <span className="block group-hover:text-primary">{s.name}</span>
                {s.description && (
                  <span className="text-sm text-muted-foreground">
                    {s.description}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                {s.noteCount} Notes
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </section>
      )}

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Notes · {noteList.length}
        </h2>
        {noteList.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="font-serif text-xl">
              No notes in this collection yet.
            </p>
            <p className="text-sm text-muted-foreground">
              The collection creator hasn&apos;t added any public notes yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* swap for your existing <NoteCard note={n} /> — each note keeps its own contributor */}
            {noteList.map((n) => (
              <Link
                key={n.id}
                href={`/notes/${n.slug}`}
                className="rounded-xl border p-5 transition-colors hover:border-foreground/25"
              >
                <h3 className="font-serif text-lg">{n.title}</h3>
                <p className="text-sm text-muted-foreground">
                  by {n.contributor.name} · {n.viewCount} Views ·{" "}
                  {n.downloadCount} Downloads
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-14 space-y-4">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            You may also like
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <CollectionCard key={r.id} c={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
