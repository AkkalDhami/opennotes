import { Metadata, Route } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  Calendar04Icon,
  Download01Icon,
  File01Icon,
  File02Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

interface NoteDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: NoteDetailPageProps): Promise<Metadata> {
  const { slug } = await params

  const note = await getPublishedNoteBySlug(slug)

  if (!note) {
    return {
      title: "Note Not Found",
      description: "The requested educational note could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = `${note.title} — ${note.subject} ${note.grade} Notes`

  const description =
    note.description?.slice(0, 155) ||
    `${note.title} — ${note.subject} notes for ${note.grade}. View and download this educational PDF shared by ${note.contributor.name}.`

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
        <div className="flex-1 space-y-4">
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
          <Heading>Title: {note.title}</Heading>
          <div className="flex flex-wrap items-center gap-2 text-base font-medium text-muted-foreground">
            <span>{slugToTitle(note.educationLevel)}</span>
            <span aria-hidden="true">·</span>
            <span>{slugToTitle(note.subject)}</span>
            <span aria-hidden="true">·</span>
            <span>{slugToTitle(note.course)}</span>
            {note.grade && (
              <>
                <span aria-hidden="true">·</span>
                <span>{slugToTitle(note.grade)}</span>
              </>
            )}
            {note.topic && (
              <>
                <span aria-hidden="true">·</span>
                <span>{note.topic}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{slugToTitle(note.course)}</span>
          </div>
          {note.description && (
            <p className="text-base text-muted-foreground">
              {note.description}
            </p>
          )}
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
          <Separator className="my-4" />
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat
              icon={Download01Icon}
              label="Downloads"
              value={formatCompactNumber(note.downloadCount)}
            />

            <Stat
              icon={File01Icon}
              label="File size"
              value={
                note.fileSizeBytes != null
                  ? formatFileSize(note.fileSizeBytes)
                  : "—"
              }
            />

            <Stat
              icon={File02Icon}
              label="Total Pages"
              value={
                note.pageCount != null
                  ? formatCompactNumber(note.pageCount)
                  : "-"
              }
            />
          </dl>
          <NoteActions note={note} fileUrl={fileUrl} />
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
          {note.sourceType !== "ORIGINAL" && (
            <NoteSourceInfo
              sourceType={note.sourceType}
              originalAuthor={note.originalAuthor}
              sourceUrl={note.sourceUrl}
            />
          )}
          <Separator className="my-4" />
          <NotePdfViewer note={note} fileUrl={fileUrl} />
          <RelatedNotes note={note} />
        </div>
        <div className="sticky top-20 h-auto max-w-80 sm:w-100">
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
    <div className="rounded-lg border bg-card p-3">
      <dt className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{label}</span>
        <HugeiconsIcon
          icon={icon}
          size={14}
          color="currentColor"
          strokeWidth={2}
          className="size-4"
        />
      </dt>
      <dd className="mt-1 text-lg font-semibold text-foreground">{value}</dd>
    </div>
  )
}
