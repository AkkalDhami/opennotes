import type { Metadata, Route } from "next"
import Link from "next/link"
import { Suspense } from "react"
import {
  getCollectionFilterOptions,
  getPublicCollections,
  type SortKey,
} from "@/lib/collections/collections-queries"
import {
  CollectionCard,
  type CollectionView,
} from "@/components/collections/collection-card"
import {
  CollectionSearch,
  CollectionSort,
} from "@/components/collections/collection-search"
import { CollectionFilters } from "@/components/collections/collection-filters"
import { CollectionPagination } from "@/components/collections/collection-pagination"
import { Button } from "@/components/ui/button"
import { SubHeading } from "@/components/ui/sub-heading"
import { Heading } from "@/components/ui/heading"
import { APP_NAME } from "@/constants/app.constants"
import { Highlight } from "@/components/ui/highlight"
import { ContributorMedalShowcase } from "@/components/shared/medal-showcase"
import { CollectionViewSwitcher } from "@/components/user/collections/collection-view-switcher"

type SP = {
  q?: string
  sort?: SortKey
  level?: string
  course?: string
  subject?: string
  creatorId?: string
  view?: CollectionView
  size?: string
  page?: string
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>
}): Promise<Metadata> {
  const sp = await searchParams
  const filtered = Object.entries(sp).some(([k, v]) => v && k !== "page")
  return {
    title: "Explore Collections",
    description:
      "Discover public collections of study notes organized by students and educators. Find resources by subject, course, education level.",
    alternates: { canonical: "/collections" },
    robots: filtered
      ? {
          index: false,
          follow: true,
        }
      : undefined, // keep faceted URLs out of the index
  }
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const sp = await searchParams
  const [{ items, total, page, totalPages }, options] = await Promise.all([
    getPublicCollections({
      ...sp,
      page: Number(sp.page) || 1,
      topLevelOnly: true,
    }),
    getCollectionFilterOptions({ topLevelOnly: true }),
  ])
  const view: CollectionView = sp.view === "list" ? "list" : "grid"
  const filtered = !!(
    sp.q ||
    sp.level ||
    sp.course ||
    sp.subject ||
    sp.creatorId ||
    sp.size
  )

  return (
    <section className="space-y-6">
      <div className="mb-6 space-y-2">
        <Heading>
          Study{" "}
          <Highlight animate={false} color="var(--primary)" variant="outline">
            Collections
          </Highlight>
        </Heading>
        <SubHeading>
          Find organized notes and study materials shared by the {APP_NAME}{" "}
          community.
        </SubHeading>
      </div>

      <Suspense>
        <CollectionSearch />
      </Suspense>
      <div className="mt-6 space-y-4">
        <Suspense>
          <CollectionFilters options={options} />
        </Suspense>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing{" "}
            <strong className="font-medium">{total.toLocaleString()}</strong>{" "}
            public collection
            {total === 1 ? "" : "s"}
            {totalPages > 1 && ` · page ${page} of ${totalPages}`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Suspense>
              <CollectionSort />
            </Suspense>
            <Suspense>
              <CollectionViewSwitcher value={view} className="shrink-0" />
            </Suspense>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <section className="mx-auto max-w-md space-y-4 py-24 text-center">
          <h2 className="font-serif text-2xl tracking-wider">
            {filtered ? "No collections found." : "No public collections yet."}
          </h2>
          <p className="text-muted-foreground">
            {filtered
              ? "Try a different search term or remove a filter."
              : "The community is still building the library. Be one of the first to organize useful notes for other students."}
          </p>
          <Button
            nativeButton={false}
            render={
              <Link
                href={(filtered ? "/collections" : "/contribution") as Route}
              >
                {filtered ? "Clear filters" : "Share your notes"}
              </Link>
            }
          />
        </section>
      ) : (
        <>
          <div
            className={
              view === "list"
                ? "mt-4 border-b"
                : "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {items.map((c, i) => (
              <CollectionCard key={c.id} c={c} index={i} view={view} />
            ))}
          </div>
          <CollectionPagination
            page={page}
            totalPages={totalPages}
            params={sp}
          />
        </>
      )}

      <ContributorMedalShowcase minimal />
    </section>
  )
}
