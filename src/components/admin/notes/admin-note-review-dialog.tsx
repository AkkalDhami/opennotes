/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  NOTE_STATUS_DISPLAY,
  PROCESSING_STATUS_DISPLAY,
  SOURCE_TYPE_DISPLAY,
} from "@/configs/note-display"
import {
  formatExactNumber,
  formatFileSize,
  formatFullTimestamp,
  formatNoteMeta,
} from "@/utils/format"
import { AdminNoteDetail, AdminNoteListItem } from "@/types/note"
import { fetchAdminNoteDetail } from "@/lib/admin/notes/admin-notes-queries"
import {
  publishAdminNote,
  rejectAdminNote,
} from "@/lib/admin/notes/admin-notes"
import { toast } from "react-hot-toast"

interface AdminNoteReviewDialogProps {
  note: AdminNoteListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminNoteReviewDialog({
  note,
  open,
  onOpenChange,
}: AdminNoteReviewDialogProps) {
  const [detail, setDetail] = useState<AdminNoteDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) {
      setRejecting(false)
      setRejectReason("")
      setError(null)
      return
    }
    setIsLoading(true)
    fetchAdminNoteDetail(note.id)
      .then(setDetail)
      .finally(() => setIsLoading(false))
  }, [open, note.id])

  function handlePublish() {
    setError(null)
    startTransition(async () => {
      const result = await publishAdminNote({ noteId: note.id })
      if (result.success) {
        toast.success("Note published successfully.")
        onOpenChange(false)
      } else {
        setError(result.error ?? "Something went wrong.")
      }
    })
  }

  function handleReject() {
    if (rejectReason.trim().length < 10) {
      setError("Give the contributor at least a short explanation.")
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await rejectAdminNote({
        noteId: note.id,
        reason: rejectReason,
      })
      if (result.success) {
        toast.success("Note rejected successfully.")
        onOpenChange(false)
      } else {
        setError(result.error ?? "Something went wrong.")
      }
    })
  }

  const source = detail ? SOURCE_TYPE_DISPLAY[detail.sourceType] : null
  const status = detail ? NOTE_STATUS_DISPLAY[detail.status] : null
  const processing = detail
    ? PROCESSING_STATUS_DISPLAY[detail.processingStatus]
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{note.title}</DialogTitle>
        </DialogHeader>

        {isLoading || !detail ? (
          <div className="flex-1 space-y-3 overflow-y-auto py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-full animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto py-2 md:grid-cols-[1.4fr_1fr]">
            {/* Left: content */}
            <div className="space-y-4">
              <div className="flex aspect-3/4 w-full items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                PDF preview —{" "}
                {formatNoteMeta([
                  detail.pageCount ? `${detail.pageCount} pages` : null,
                ])}
              </div>

              {detail.description && (
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Description
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {detail.description}
                  </p>
                </div>
              )}

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Subject</dt>
                  <dd className="font-medium text-foreground">
                    {detail.subject}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Grade</dt>
                  <dd className="font-medium text-foreground">
                    {detail.grade ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Topic</dt>
                  <dd className="font-medium text-foreground">
                    {detail.topic ?? "—"}
                  </dd>
                </div>
              </dl>

              {detail.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detail.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Right: sidebar */}
            <div className="space-y-4">
              <section>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Contributor
                </h3>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {detail.contributor.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{detail.contributor.username}
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Source & attribution
                </h3>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {source?.label}
                </p>
                {detail.sourceAuthor && (
                  <p className="text-sm text-muted-foreground">
                    Original author: {detail.sourceAuthor}
                  </p>
                )}
                {detail.sourceUrl && (
                  <a
                    href={detail.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                  >
                    View source
                  </a>
                )}
              </section>

              <Separator />

              <section>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  File information
                </h3>
                <dl className="mt-1 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Size</dt>
                    <dd className="text-foreground">
                      {formatFileSize(detail.fileSizeBytes)}
                    </dd>
                  </div>
                  {detail.pageCount != null && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Pages</dt>
                      <dd className="text-foreground">
                        {formatExactNumber(detail.pageCount)}
                      </dd>
                    </div>
                  )}
                  {detail.fileHash && (
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0 text-muted-foreground">
                        SHA-256
                      </dt>
                      <dd
                        className="truncate font-mono text-xs text-foreground"
                        title={detail.fileHash}
                      >
                        {detail.fileHash}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Uploaded</dt>
                    <dd className="text-foreground">
                      {formatFullTimestamp(detail.createdAt)}
                    </dd>
                  </div>
                </dl>
              </section>

              <Separator />

              <section className="flex flex-wrap gap-2">
                {status && (
                  <Badge variant={status.badgeVariant} className="font-normal">
                    {status.label}
                  </Badge>
                )}
                {processing && (
                  <Badge
                    variant={processing.badgeVariant}
                    className="font-normal"
                  >
                    {processing.label}
                  </Badge>
                )}
              </section>
            </div>
          </div>
        )}

        {!isLoading && detail && (
          <div className="border-t border-border pt-4">
            {rejecting ? (
              <div className="space-y-3">
                <Label htmlFor="reject-reason">
                  Why are you rejecting this note?
                </Label>
                <Textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Explain what needs to change so the contributor can resubmit…"
                  rows={3}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setRejecting(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isPending}
                  >
                    {isPending ? "Rejecting…" : "Reject note"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end gap-2">
                {error && (
                  <p className="mr-auto self-center text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button
                  variant="outline"
                  onClick={() => setRejecting(true)}
                  disabled={isPending}
                >
                  Reject
                </Button>
                <Button onClick={handlePublish} disabled={isPending}>
                  {isPending ? "Publishing…" : "Publish"}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
