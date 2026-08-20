"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalIcon,
  ViewIcon,
  Edit02Icon,
  Delete02Icon,
  UserIcon,
  CheckmarkBadge01Icon,
  Cancel01Icon,
  Clock01Icon,
  ArrowLeft01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { AdminNoteReviewDialog } from "@/components/admin/notes/admin-note-review-dialog"
import { AdminNoteRemoveDialog } from "@/components/admin/notes/admin-note-remove-dialog"
import { AdminNotePublishDialog } from "@/components/admin/notes/admin-note-publish-dialog"
import { AdminNoteConfirmDialog } from "@/components/admin/notes/admin-note-confirm-dialog"
import { AdminNoteListItem } from "@/types/note"
import { Route } from "next"

type DialogState =
  "review" | "remove" | "publish" | "unpublish" | "restore" | null

export function AdminNoteActions({ note }: { note: AdminNoteListItem }) {
  const [openDialog, setOpenDialog] = useState<DialogState>(null)

  return (
    <>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8">
                <HugeiconsIcon
                  icon={MoreVerticalIcon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="size-4"
                />
                <span className="sr-only">Open actions for {note.title}</span>
              </Button>
            }
          />
          <MenubarContent align="center" className={"w-50"}>
            {note.status === "PUBLISHED" && (
              <>
                <MenubarItem
                  render={<Link href={`/notes/${note.slug}`} target="_blank" />}
                >
                  <HugeiconsIcon
                    icon={ViewIcon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  View note
                </MenubarItem>
                <MenubarItem
                  render={
                    <Link
                      href={`/admin/contributors/${note.contributor.username}`}
                    />
                  }
                >
                  <HugeiconsIcon
                    icon={UserIcon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  View contributor
                </MenubarItem>
                <MenubarItem
                  render={
                    <Link href={`/admin/notes/${note.id}/edit` as Route} />
                  }
                >
                  <HugeiconsIcon
                    icon={Edit02Icon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Edit
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setOpenDialog("unpublish")}>
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Unpublish
                </MenubarItem>
                <MenubarItem
                  variant="destructive"
                  onClick={() => setOpenDialog("remove")}
                >
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Remove
                </MenubarItem>
              </>
            )}

            {note.status === "PENDING_REVIEW" && (
              <>
                <MenubarItem onClick={() => setOpenDialog("review")}>
                  <HugeiconsIcon
                    icon={ViewIcon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Review
                </MenubarItem>
                <MenubarItem
                  render={
                    <Link
                      href={`/notes/${note.slug}?preview=1`}
                      target="_blank"
                    />
                  }
                >
                  <HugeiconsIcon
                    icon={ViewIcon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  View note
                </MenubarItem>
                <MenubarItem
                  render={
                    <Link href={`/admin/contributors/${note.contributor.id}`} />
                  }
                >
                  <HugeiconsIcon
                    icon={UserIcon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  View contributor
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setOpenDialog("publish")}>
                  <HugeiconsIcon
                    icon={CheckmarkBadge01Icon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Publish
                </MenubarItem>
                <MenubarItem
                  variant="destructive"
                  onClick={() => setOpenDialog("review")}
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Reject
                </MenubarItem>
              </>
            )}

            {note.status === "REJECTED" && (
              <>
                <MenubarItem
                  render={
                    <Link
                      href={`/notes/${note.slug}?preview=1`}
                      target="_blank"
                    />
                  }
                >
                  <HugeiconsIcon
                    icon={ViewIcon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  View
                </MenubarItem>
                <MenubarItem
                  render={
                    <Link href={`/admin/notes/${note.id}/edit` as Route} />
                  }
                >
                  <HugeiconsIcon
                    icon={Edit02Icon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Edit
                </MenubarItem>
                <MenubarItem onClick={() => setOpenDialog("publish")}>
                  <HugeiconsIcon
                    icon={CheckmarkBadge01Icon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Publish
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem
                  variant="destructive"
                  onClick={() => setOpenDialog("remove")}
                >
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Remove
                </MenubarItem>
              </>
            )}

            {note.status === "REMOVED" && (
              <>
                <MenubarItem render={<Link href={`/admin/notes/${note.id}`} />}>
                  <HugeiconsIcon
                    icon={ViewIcon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  View
                </MenubarItem>
                <MenubarItem onClick={() => setOpenDialog("restore")}>
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Restore
                </MenubarItem>
                <MenubarItem
                  render={<Link href={`/admin/notes/${note.id}#history`} />}
                >
                  <HugeiconsIcon
                    icon={Alert02Icon}
                    size={16}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Moderation history
                </MenubarItem>
              </>
            )}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <AdminNoteReviewDialog
        note={note}
        open={openDialog === "review"}
        onOpenChange={(open) => setOpenDialog(open ? "review" : null)}
      />
      <AdminNoteRemoveDialog
        note={note}
        open={openDialog === "remove"}
        onOpenChange={(open) => setOpenDialog(open ? "remove" : null)}
      />
      <AdminNotePublishDialog
        note={note}
        open={openDialog === "publish"}
        onOpenChange={(open) => setOpenDialog(open ? "publish" : null)}
      />
      <AdminNoteConfirmDialog
        note={note}
        action="unpublish"
        open={openDialog === "unpublish"}
        onOpenChange={(open) => setOpenDialog(open ? "unpublish" : null)}
      />
      <AdminNoteConfirmDialog
        note={note}
        action="restore"
        open={openDialog === "restore"}
        onOpenChange={(open) => setOpenDialog(open ? "restore" : null)}
      />
    </>
  )
}
