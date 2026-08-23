import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { SavedNotesEmpty } from "@/components/user/saved-notes/saved-notes-empty"
import { SavedNotesGrid } from "@/components/user/saved-notes/saved-notes-grid"
import { SavedNotesToolbar } from "@/components/user/saved-notes/saved-notes-toolbar"
import { APP_NAME } from "@/constants/app.constants"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import {
  getSavedNotes,
  parseSavedNotesSort,
  SavedNotesSort,
} from "@/lib/user/saved-notes"
import { Metadata, Route } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { NoteCardSkeletonGrid } from "@/components/notes/note-card-skeleton"

export const metadata: Metadata = {
  title: "Saved Notes",
  description: `Find the notes you saved on ${APP_NAME} to read or study later.`,
}

interface ISearchParams {
  q?: string
  sort?: string
  page?: string
}

function buildHref(targetPage: number, query?: string, sort?: string) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (sort && sort !== "recent") params.set("sort", sort)
  if (targetPage > 1) params.set("page", String(targetPage))
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

async function SavedNotesContent({
  userId,
  query,
  sort,
  page,
}: {
  userId: string
  query?: string
  sort: string
  page: number
}) {
  const { notes, total, totalPages } = await getSavedNotes({
    userId,
    query,
    sort: parseSavedNotesSort(sort),
    page,
  })

  const isEmpty = notes.length === 0

  if (isEmpty) {
    return (
      <>
        <SavedNotesEmpty query={query} />
      </>
    )
  }

  return (
    <>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {total} {total === 1 ? "saved note" : "saved notes"}
      </p>
      <SavedNotesGrid
        key={`${query ?? ""}-${sort}-${page}`}
        initialNotes={notes}
      />

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={
                  `/profile/saved-notes${buildHref(Math.max(1, page - 1), query, sort)}` as Route
                }
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={
                    `/profile/saved-notes${buildHref(i + 1, query, sort)}` as Route
                  }
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href={
                  `/profile/saved-notes${buildHref(Math.min(totalPages, page + 1), query, sort)}` as Route
                }
                aria-disabled={page >= totalPages}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  )
}

export default async function page(props: PageProps<"/profile/saved-notes">) {
  const searchParams = (await props.searchParams) as ISearchParams

  const user = await getCurrentUser()

  if (!user) {
    redirect("/signin?next=/profile/saved-notes")
  }

  const query = searchParams.q?.trim() || undefined
  const sort = searchParams.sort ?? "recent"
  const page = Number.parseInt(searchParams.page ?? "1", 10) || 1

  return (
    <DashboardContainer>
      <PageHeader
        title="Saved Notes"
        description="Find the notes you bookmarked to read or study later."
      />

      <SavedNotesToolbar
        defaultQuery={query ?? ""}
        defaultSort={sort as SavedNotesSort}
      />

      <Suspense fallback={<NoteCardSkeletonGrid count={9} />}>
        <SavedNotesContent
          userId={user.id}
          query={query}
          sort={sort}
          page={page}
        />
      </Suspense>
    </DashboardContainer>
  )
}
