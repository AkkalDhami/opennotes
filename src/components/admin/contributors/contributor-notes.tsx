import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ContributorPagination } from "./contributor-pagination"
import { ContributorNoteItem } from "./queries";
import { Route } from "next";

/**
 * NOTE: If the project already has a shared public note card component
 * (e.g. the one used on /notes or the homepage), swap the markup below
 * for that component instead — this local card is only a fallback since
 * no shared note card was supplied when this page was built.
 */
export function ContributorNotes({
  notes,
  page,
  totalPages,
  username,
}: {
  notes: ContributorNoteItem[]
  page: number
  totalPages: number
  username: string
}) {
  if (notes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No published notes yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {notes.map((note) => (
          <li key={note.id}>
            <Card className="h-full border-border bg-card">
              <CardContent className="flex flex-col gap-2 py-5">
                <Link
                  href={`/notes/${note.slug}` as Route}
                  className="font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {note.title}
                </Link>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{note.subject}</Badge>
                  <Badge variant="outline">{note.category}</Badge>
                  {note.educationLevel && (
                    <Badge variant="outline">{note.educationLevel}</Badge>
                  )}
                  {note.grade && <Badge variant="outline">{note.grade}</Badge>}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {note.publishedAt && (
                    <span>
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(note.publishedAt)}
                    </span>
                  )}
                  <span>{note.downloadCount.toLocaleString()} downloads</span>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <ContributorPagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) =>
          p > 1
            ? `/contributors/${username}?page=${p}`
            : `/contributors/${username}`
        }
      />
    </div>
  )
}
