import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Calendar03Icon,
  Download01Icon,
  EllipsisVerticalIcon,
  File01Icon,
  FileEditIcon,
  GraduationScrollIcon,
  LegalDocument01Icon,
  Link04Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react"
import { ContributionStatusBadge } from "./contribution-status-badge"
import { ContributionActions } from "./contribution-actions"
import { formatFullDate, formatRelativeTime } from "@/utils/format-date"
import { AdminContributionRow } from "@/lib/notes/queries"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getInitials } from "@/utils/get-initials"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { getNoteBySlug } from "@/utils/get-file-url"
import { Route } from "next"
import { ApproveContributionButton } from "./approve-contribution-button"
import { RestoreContributionDialog } from "./restore-contribution-dialog"
import { RemoveContributionDialog } from "./remove-contribution-dialog"
import { RejectContributionDialog } from "./reject-contribution-dialog"
import { sliceContent } from "@/utils/slice-content"
import { cn } from "@/lib/utils"
import { slugToTitle } from "@/utils/slug"

export function ContributionsTable({
  items,
}: {
  items: AdminContributionRow[]
}) {
  if (items.length === 0) {
    return <ContributionsEmptyState />
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Note</TableHead>
              <TableHead>Contributor</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="">Downloads</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((note) => (
              <TableRow key={note.id} className="hover:bg-muted/50">
                <TableCell className="max-w-70">
                  <div className="flex items-start gap-2">
                    <HugeiconsIcon
                      icon={File01Icon}
                      size={16}
                      strokeWidth={2}
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/admin/contributions/${note.id}`}
                        className="truncate font-medium text-foreground underline-offset-2 hover:underline"
                      >
                        {sliceContent(note.title)}
                      </Link>
                      {note.description && (
                        <p className="truncate text-xs text-muted-foreground">
                          {note.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarImage src={note.contributor.avatar ?? undefined} />
                      <AvatarFallback>
                        {note.contributor.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">
                        {note.contributor.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{note.contributor.username}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-foreground">
                  {slugToTitle(note.subject)}
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <HugeiconsIcon
                      icon={Download01Icon}
                      size={14}
                      color="currentColor"
                      strokeWidth={2}
                      className="size-3.5 text-muted-foreground"
                    />
                    {note.downloadCount.toLocaleString()}
                  </span>
                </TableCell>

                <TableCell>
                  <ContributionStatusBadge status={note.status} />
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(note.createdAt)}
                        </span>
                      }
                    ></TooltipTrigger>
                    <TooltipContent>
                      {formatFullDate(note.createdAt)}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                <TableCell className="text-right">
                  <Link
                    href={`/admin/contributions/${note.id}`}
                    className={cn(
                      buttonVariants({
                        size: "sm",
                        variant: "outline",
                        className: "size-8",
                      }),
                      "mr-2 rounded-full"
                    )}
                  >
                    <HugeiconsIcon
                      icon={Link04Icon}
                      size={20}
                      color="currentColor"
                      strokeWidth={2}
                    />
                  </Link>
                  <ContributionSheet contribution={note} />
                  {/* <ContributionActions
                    noteId={note.id}
                    noteTitle={note.title}
                    status={note.status}
                  /> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {items.map((note) => (
          <div
            key={note.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {note.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {note.subject} · {formatRelativeTime(note.createdAt)}
                </p>
              </div>
              <ContributionStatusBadge status={note.status} />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={note.contributor.avatar ?? undefined} />
                <AvatarFallback>
                  {note.contributor.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {note.contributor.name} · @{note.contributor.username}
              </span>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <ContributionActions
                noteId={note.id}
                noteTitle={note.title}
                status={note.status}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <HugeiconsIcon icon={icon} size={15} strokeWidth={1.8} />
        {label}
      </div>

      <p className="text-sm font-medium">{value || "Not specified"}</p>
    </div>
  )
}

export async function ContributionSheet({
  contribution,
}: {
  contribution: AdminContributionRow
}) {
  const note = await getNoteBySlug(contribution.slug)

  if (!note) {
    return null
  }

  const { id, status: noteStatus, title } = note

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full">
            <HugeiconsIcon
              icon={EllipsisVerticalIcon}
              size={18}
              strokeWidth={2}
            />
            <span className="sr-only">View contribution</span>
          </Button>
        }
      />

      <SheetContent className="w-full p-0 sm:max-w-xl">
        <ScrollArea className="h-full">
          <div className="flex min-h-full flex-col">
            <div className="mt-8 space-y-7 px-6 py-6">
              <div className="flex items-start justify-between gap-4 border-b pb-4">
                <div className="min-w-0 space-y-1">
                  <SheetTitle className="text-xl leading-tight">
                    Contribution details
                  </SheetTitle>

                  <SheetDescription className="truncate">
                    Review the submitted note before taking action.
                  </SheetDescription>
                </div>

                <ContributionStatusBadge status={note.status} />
              </div>
              <section className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <HugeiconsIcon
                      icon={LegalDocument01Icon}
                      size={21}
                      strokeWidth={2}
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <Link
                      href={note?.fileUrl as Route}
                      target="_blank"
                      className="text-base leading-tight font-semibold underline-offset-2 hover:underline"
                    >
                      {contribution.title}
                    </Link>

                    <Link
                      href={`/admin/contributions/${contribution.id}`}
                      className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {contribution.description && (
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                      {contribution.description}
                    </p>
                  </div>
                )}
              </section>

              <Separator />

              {/* Academic information */}
              <section className="space-y-4">
                <div>
                  <h3 className="font-semibold">Academic information</h3>
                  <p className="text-sm text-muted-foreground">
                    Information provided by the contributor.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                  <InfoItem
                    icon={GraduationScrollIcon}
                    label="Subject"
                    value={slugToTitle(contribution.subject)}
                  />

                  <InfoItem
                    icon={LegalDocument01Icon}
                    label="Category"
                    value={slugToTitle(contribution.category)}
                  />

                  <InfoItem
                    icon={GraduationScrollIcon}
                    label="Education level"
                    value={slugToTitle(contribution.educationLevel ?? "")}
                  />

                  <InfoItem
                    icon={GraduationScrollIcon}
                    label="Grade / Year"
                    value={slugToTitle(contribution.grade ?? "")}
                  />
                </div>
              </section>

              <Separator />

              {/* Contributor */}
              <section className="space-y-4">
                <div>
                  <h3 className="font-semibold">Contributor</h3>
                  <p className="text-sm text-muted-foreground">
                    User who submitted this note.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-4">
                  <Avatar className="size-11">
                    <AvatarImage
                      src={contribution.contributor.avatar ?? undefined}
                      alt={contribution.contributor.name}
                    />

                    <AvatarFallback>
                      {getInitials(contribution.contributor.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {contribution.contributor.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      @{contribution.contributor.username}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    nativeButton={false}
                    size="sm"
                    render={
                      <a
                        href={`/admin/users/${contribution.contributor.username}`}
                      >
                        View
                      </a>
                    }
                  ></Button>
                </div>
              </section>

              <Separator />

              {/* Submission details */}
              <section className="space-y-4">
                <div>
                  <h3 className="font-semibold">Submission details</h3>
                  <p className="text-sm text-muted-foreground">
                    Internal information about this contribution.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                  <InfoItem
                    icon={Calendar03Icon}
                    label="Submitted"
                    value={formatFullDate(contribution.createdAt)}
                  />

                  <InfoItem
                    icon={UserCircleIcon}
                    label="Contributor ID"
                    value={contribution.contributor.id}
                  />

                  <InfoItem
                    icon={LegalDocument01Icon}
                    label="Note ID"
                    value={contribution.id}
                  />

                  <InfoItem
                    icon={FileEditIcon}
                    label="Status"
                    value={contribution.status}
                  />
                </div>
              </section>

              <Separator />

              {/* Actions */}
              {contribution.status === "PENDING_REVIEW" && (
                <section className="space-y-3">
                  <div>
                    <h3 className="font-semibold">Review contribution</h3>

                    <p className="text-sm text-muted-foreground">
                      Approve the note to make it publicly available.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {noteStatus === "PENDING_REVIEW" && (
                      <>
                        <ApproveContributionButton noteId={note?.id} />
                        <RejectContributionDialog noteId={note?.id} />
                      </>
                    )}

                    {noteStatus === "PUBLISHED" && (
                      <RemoveContributionDialog noteId={id} noteTitle={title} />
                    )}

                    {noteStatus === "REJECTED" && (
                      <RestoreContributionDialog
                        noteId={id}
                        noteTitle={title}
                        fromStatus="REJECTED"
                      />
                    )}

                    {noteStatus === "REMOVED" && (
                      <RestoreContributionDialog
                        noteId={id}
                        noteTitle={title}
                        fromStatus="REMOVED"
                      />
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
function ContributionsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <HugeiconsIcon
        icon={File01Icon}
        size={32}
        strokeWidth={2}
        className="size-8 text-muted-foreground"
        aria-hidden="true"
      />
      <p className="mt-3 font-medium text-foreground">No contributions found</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Try adjusting your filters or search terms.
      </p>
    </div>
  )
}
