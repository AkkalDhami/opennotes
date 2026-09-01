import { Metadata, Route } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  Calendar04Icon,
  Download01Icon,
  File01Icon,
  File02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { getPublishedNoteBySlug } from "@/lib/notes/get-note"
import { NoteActions } from "@/components/notes/note-actions"
import { NotePdfViewer } from "@/components/notes/note-pdf-viewer"
import { ContributorPreview } from "@/components/notes/contributor-preview"
import { RelatedNotes } from "@/components/notes/related-notes"
import { formatFileSize, formatCompactNumber } from "@/lib/notes/format"
import { APP_NAME } from "@/constants/app.constants"
import { getFileUrl } from "@/utils/get-file-url"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { slugToTitle } from "@/utils/slug"
import { Heading } from "@/components/ui/heading"
import { formatDate } from "@/utils/format-date"
import { getRelatedNotesByContributor } from "@/lib/notes/get-related-notes"
import { NoteSourceInfo } from "@/components/notes/note-source-info"
import { absoluteUrl } from "@/lib/seo"
import { NoteJsonLd } from "@/components/seo/note-json-ld"
import { formatNoteMeta } from "@/utils/format"
import { BookmarkButton } from "@/components/shared/bookmark-button"

interface NoteDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: NoteDetailPageProps): Promise<Metadata> {
  const { slug } = await params

  const note = await getPublishedNoteBySlug(slug)

  if (!note) {
    redirect("/notes")
  }

  const title = `${note.title} — ${slugToTitle(note.subject)} ${slugToTitle(note.grade ?? "")} Notes`

  const description =
    note.description?.slice(0, 155) ||
    `${note.title} — ${slugToTitle(note.subject)} notes for ${slugToTitle(note.grade ?? "")}. View and download this educational PDF shared by @${note.contributor.username}.`

  const url = absoluteUrl(`/notes/${note.slug}`)

  return {
    title,

    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      type: "article",
      siteName: APP_NAME,
      title,
      description,
      url,
      authors: [note.contributor.name],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },

    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { slug } = await params
  const note = await getPublishedNoteBySlug(slug)

  if (!note) {
    notFound()
  }

  const fileUrl = getFileUrl(note?.filePath)

  const publishedDate = new Date(note.publishedAt)

  const contributorNotes = await getRelatedNotesByContributor({
    contributorId: note.contributor.id,
  })

  const filteredNotes = contributorNotes.filter((n) => n.slug !== note.slug)

  return (
    <>
      <NoteJsonLd
        note={{
          contributor: note.contributor,
          description: note.description,
          grade: note.grade || "",
          publishedAt: note.publishedAt,
          slug: note.slug,
          subject: note.subject,
          title: note.title,
        }}
      />
      <div className="flex w-full flex-col gap-6 lg:flex-row">
        <div className="relative flex-1 space-y-4">
          <Link
            href={"/notes" as Route}
            className={cn(
              buttonVariants({
                variant: "secondary",
              })
            )}
          >
            <HugeiconsIcon
              icon={ArrowLeft02Icon}
              size={22}
              color="currentColor"
              strokeWidth={1.5}
            />{" "}
            All Notes
          </Link>

          <BookmarkButton
            className="top-0"
            noteId={note.id}
            size={"size-6"}
            initialBookmarked={note.isBookmarked}
          />

          <div className="flex flex-wrap items-center gap-2 text-base font-medium text-muted-foreground">
            {formatNoteMeta([
              slugToTitle(note.educationLevel),
              slugToTitle(note.course),
              note.grade && slugToTitle(note.grade),
              slugToTitle(note.subject),
              note.topic,
            ])}
          </div>
          <Heading>{note.title}</Heading>
          {note.description && (
            <p className="text-base text-muted-foreground">
              {note.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <Stat
              icon={Download01Icon}
              label={note.downloadCount === 1 ? "download" : "downloads"}
              value={formatCompactNumber(note.downloadCount)}
            />

            <Stat
              icon={ViewIcon}
              label={note.viewCount === 1 ? "view" : "views"}
              value={formatCompactNumber(note.viewCount) ?? 0}
            />

            <Stat
              icon={File01Icon}
              label="file size"
              value={
                note.fileSizeBytes != null
                  ? formatFileSize(note.fileSizeBytes)
                  : "—"
              }
            />

            {note.pageCount != null && (
              <Stat
                icon={File02Icon}
                label={note.pageCount === 1 ? "page" : "pages"}
                value={
                  note.pageCount != null
                    ? formatCompactNumber(note.pageCount)
                    : "-"
                }
              />
            )}
          </div>
          <NoteActions note={note} fileUrl={fileUrl} />

          {note.sourceType !== "ORIGINAL" && (
            <NoteSourceInfo
              sourceType={note.sourceType}
              originalAuthor={note.originalAuthor}
              sourceUrl={note.sourceUrl}
            />
          )}
          <NotePdfViewer note={note} fileUrl={fileUrl} />

          <div className="mt-4 space-y-4">
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {note.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/notes?tags=${encodeURIComponent(tag)}` as Route}
                  >
                    <Badge
                      variant="outline"
                      className="text-sm hover:bg-secondary/80"
                    >
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <p className="flex items-center gap-2 text-base text-muted-foreground">
                <HugeiconsIcon
                  icon={Calendar04Icon}
                  size={24}
                  color="currentColor"
                  strokeWidth={2}
                  className="size-4"
                />
                Published{" "}
                {formatDate(publishedDate, {
                  dateStyle: "full",
                })}
              </p>
              {note.lastModifiedAt &&
                formatDate(note.lastModifiedAt, {
                  dateStyle: "full",
                }).toLocaleLowerCase() !==
                  formatDate(publishedDate, {
                    dateStyle: "full",
                  }).toLocaleLowerCase() && (
                  <p className="flex items-center gap-2 text-base text-muted-foreground">
                    <HugeiconsIcon
                      icon={Calendar04Icon}
                      size={24}
                      color="currentColor"
                      strokeWidth={2}
                      className="size-4"
                    />
                    Last Updated{" "}
                    {formatDate(note.lastModifiedAt, {
                      dateStyle: "full",
                    })}
                  </p>
                )}
            </div>
          </div>

          <RelatedNotes note={note} />
        </div>
        <div className="sticky top-20 lg:w-100 lg:max-w-80">
          <ContributorPreview
            contributor={note.contributor}
            notes={filteredNotes}
          />
        </div>
      </div>
    </>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"]
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg text-base text-muted-foreground">
      <HugeiconsIcon
        icon={icon}
        size={14}
        color="currentColor"
        strokeWidth={2}
        className="size-4"
      />
      <span className="font-medium text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  )
}
