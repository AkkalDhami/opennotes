import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { CollectionGrid } from "@/components/user/collections/collection-grid"
import { CollectionGridSkeleton } from "@/components/user/collections/collection-grid-skeleton"
import { CollectionsStats } from "@/components/user/collections/collection-stats"
import { CollectionTree } from "@/components/user/collections/collection-tree"
import { CollectionTreeSkeleton } from "@/components/user/collections/collection-tree-skeleton"
import { CollectionView } from "@/components/user/collections/collection-view-switcher"
import { CollectionsToolbar } from "@/components/user/collections/collections-toolbar"
import { CreateCollectionButton } from "@/components/user/collections/create-collection-button"

import {
  EmptyCollectionsState,
  NoSearchResultsState,
} from "@/components/user/collections/empty-states"
import { APP_NAME } from "@/constants/app.constants"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import {
  getLibraryStats,
  getOwnerCollectionOptions,
  getUserCollectionTree,
} from "@/lib/user/collection-queries"
import { CollectionsSort } from "@/validations/collection"

import { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "My Collections",
  description: `Create, organize, and manage your notes with collections on ${APP_NAME}.`,
}

type SearchParams = {
  q?: string
  sort?: string
  view?: CollectionView
}

export default async function page(props: PageProps<"/profile/collections">) {
  const { q, sort, view = "grid" } = (await props.searchParams) as SearchParams

  const user = await getCurrentUser()
  if (!user) redirect("/signin")

  const parentOptions = await getOwnerCollectionOptions(user.id)

  return (
    <DashboardContainer>
      <PageHeader
        title="My Collections"
        description="Create and organize your notes into collections."
      >
        <CreateCollectionButton
          data={{
            parentOptions: parentOptions,
          }}
        />
      </PageHeader>

      <div className="mt-6">
        <Suspense
          fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}
        >
          <CollectionsStatsSection ownerId={user.id} />
        </Suspense>
      </div>

      <div className="mt-6">
        <CollectionsToolbar
          defaultQuery={q ?? ""}
          defaultView={view}
          defaultSort={sort}
        />
      </div>

      <div className="mt-8">
        {view === "list" ? (
          <Suspense fallback={<CollectionTreeSkeleton />}>
            <CollectionTreeSection
              ownerId={user.id}
              search={q}
              sort={sort as CollectionsSort}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<CollectionGridSkeleton />}>
            <CollectionGridSection
              ownerId={user.id}
              search={q}
              sort={sort as CollectionsSort}
            />
          </Suspense>
        )}
      </div>
    </DashboardContainer>
  )
}

async function CollectionsStatsSection({ ownerId }: { ownerId: string }) {
  const stats = await getLibraryStats(ownerId)
  return <CollectionsStats stats={stats} />
}

async function CollectionGridSection({
  ownerId,
  search,
  sort,
}: {
  ownerId: string
  search?: string
  sort: CollectionsSort
}) {
  const tree = await getUserCollectionTree({ ownerId, search, sort })

  if (tree.length === 0 && search) return <NoSearchResultsState />
  if (tree.length === 0) return <EmptyCollectionsState />

  return <CollectionGrid nodes={tree} />
}

async function CollectionTreeSection({
  ownerId,
  search,
  sort,
}: {
  ownerId: string
  search?: string
  sort: CollectionsSort
}) {
  const tree = await getUserCollectionTree({ ownerId, search, sort })

  if (tree.length === 0 && search) return <NoSearchResultsState />
  if (tree.length === 0) return <EmptyCollectionsState />

  return <CollectionTree nodes={tree} />
}
