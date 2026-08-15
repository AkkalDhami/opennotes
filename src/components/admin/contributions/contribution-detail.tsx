import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ContributionStatusBadge } from "./contribution-status-badge"
import { ContributionPdfPreview } from "./contribution-pdf-preview"
import { ApproveContributionButton } from "./approve-contribution-button"
import { RejectContributionDialog } from "./reject-contribution-dialog"
import { RemoveContributionDialog } from "./remove-contribution-dialog"
import { RestoreContributionDialog } from "./restore-contribution-dialog"
import { formatDate } from "@/utils/format-date"
import { AdminContributionDetail, ContributorStats } from "@/lib/notes/queries"
import { slugToTitle } from "@/utils/slug"

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">
        {value ?? "—"}
      </span>
    </div>
  )
}

export function ContributionDetail({
  note,
  contributorStats,
  fileUrl,
}: {
  note: AdminContributionDetail
  contributorStats: ContributorStats
  fileUrl: string | null
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{note.title}</CardTitle>
                {note.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {note.description}
                  </p>
                )}
              </div>
              <ContributionStatusBadge status={note.status} />
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-2" />
            <MetaRow label="Subject" value={slugToTitle(note.subject)} />
            <MetaRow label="Category" value={slugToTitle(note.category)} />
            <MetaRow
              label="Education Level"
              value={slugToTitle(note.educationLevel ?? "")}
            />
            <MetaRow label="Grade" value={slugToTitle(note.grade ?? "")} />
            <MetaRow label="Topic" value={note.topic} />
            <MetaRow label="Academic Year" value={note.academicYear} />
            <MetaRow label="Processing Status" value={note.processingStatus} />
            <MetaRow
              label="Submitted"
              value={formatDate(note.createdAt, {
                dateStyle: "long",
                timeStyle: "short",
              })}
            />
            <MetaRow
              label="Published"
              value={
                note.publishedAt
                  ? formatDate(note.publishedAt, {
                      dateStyle: "long",
                      timeStyle: "short",
                    })
                  : "Not published"
              }
            />
            <MetaRow
              label="Downloads"
              value={note.downloadCount.toLocaleString()}
            />
            {note?.tags && (
              <MetaRow
                label="Tags"
                value={
                  note?.tags?.length > 0
                    ? note?.tags?.map((tag) => `#${tag}`).join(", ")
                    : "None"
                }
              />
            )}

            {note.status === "REJECTED" && note.rejectionReason && (
              <>
                <Separator className="my-3" />
                <div className="rounded-md bg-destructive/10 p-3">
                  <p className="text-xs font-medium text-destructive">
                    Rejection reason
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {note.rejectionReason}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">PDF Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ContributionPdfPreview
              fileUrl={fileUrl}
              noteId={note.id}
              title={note.title}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contributor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={note.contributor.avatar ?? undefined} />
                <AvatarFallback>
                  {note.contributor.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {note.contributor.name}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  @{note.contributor.username}
                </p>
              </div>
            </div>
            <p className="mt-2 truncate text-sm text-muted-foreground">
              {note.contributor.email}
            </p>

            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {contributorStats.published}
                </p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {contributorStats.pending}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {contributorStats.rejected}
                </p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Moderation</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {note.status === "PENDING_REVIEW" && (
              <>
                <ApproveContributionButton
                  noteId={note.id}
                  label="Approve contribution"
                />
                <RejectContributionDialog noteId={note.id} />
              </>
            )}
            {note.status === "PUBLISHED" && (
              <RemoveContributionDialog
                noteId={note.id}
                noteTitle={note.title}
              />
            )}
            {note.status === "REJECTED" && (
              <RestoreContributionDialog
                noteId={note.id}
                noteTitle={note.title}
                fromStatus="REJECTED"
              />
            )}
            {note.status === "REMOVED" && (
              <RestoreContributionDialog
                noteId={note.id}
                noteTitle={note.title}
                fromStatus="REMOVED"
              />
            )}
            {note.status === "DRAFT" && (
              <p className="text-sm text-muted-foreground">
                This note is still a draft and hasn&apos;t been submitted for
                review.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
