"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalIcon,
  Edit02Icon,
  Delete02Icon,
  Upload04Icon,
  Link04Icon,
  Link01Icon,
  FileLinkIcon,
  Edit03Icon,
} from "@hugeicons/core-free-icons"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { deleteDraftContribution } from "@/lib/user/submit-contribution"
import { ContributionListItem } from "@/types/contribution"
import { Route } from "next"

interface ContributionActionsMenuProps {
  contribution: ContributionListItem
  onViewDetails: (contribution: ContributionListItem) => void
  onSubmitDraft: (contribution: ContributionListItem) => void
}

export function ContributionActionsMenu({
  contribution,
  onViewDetails,
  onSubmitDraft,
}: ContributionActionsMenuProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDeleteDraft() {
    if (isDeleting) return
    setIsDeleting(true)

    try {
      const result = await deleteDraftContribution(contribution.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(result.message)
      setDeleteOpen(false)
      router.refresh()
    } catch {
      toast.error("Unable to delete this draft. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-8">
            <HugeiconsIcon
              icon={MoreVerticalIcon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
            />
            <span className="sr-only">Open actions</span>
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-55">
        <DropdownMenuItem onClick={() => onViewDetails(contribution)}>
          <HugeiconsIcon
            icon={Link04Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
            className="mr-2 size-4"
          />
          View Details
        </DropdownMenuItem>

        <DropdownMenuItem
          nativeButton={false}
          render={
            <Link
              href={
                `/profile/contributions/${contribution.id}/preview` as Route
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <HugeiconsIcon
                icon={FileLinkIcon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="mr-2 size-4"
              />
              Preview PDF
            </Link>
          }
        ></DropdownMenuItem>

        {contribution.status === "DRAFT" ? (
          <>
            <DropdownMenuItem onClick={() => onSubmitDraft(contribution)}>
              <HugeiconsIcon
                icon={Upload04Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="mr-2 size-4"
              />
              Submit for Review
            </DropdownMenuItem>
            <DropdownMenuItem
              nativeButton={false}
              render={
                <Link
                  href={`/profile/contributions/${contribution.id}` as Route}
                >
                  <HugeiconsIcon
                    icon={Edit02Icon}
                    size={16}
                    color="currentColor"
                    strokeWidth={2}
                    className="mr-2 size-4"
                  />
                  Continue Editing
                </Link>
              }
            ></DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            nativeButton={false}
            render={
              <Link href={`/profile/contributions/${contribution.id}` as Route}>
                <HugeiconsIcon
                  icon={Edit03Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="mr-2 size-4"
                />
                Edit Note
              </Link>
            }
          ></DropdownMenuItem>
        )}

        {contribution.status === "REJECTED" ? (
          <DropdownMenuItem
            nativeButton={false}
            render={
              <Link href={`/profile/contributions/${contribution.id}` as Route}>
                <HugeiconsIcon
                  icon={Edit02Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="mr-2 size-4"
                />
                Edit &amp; Resubmit
              </Link>
            }
          ></DropdownMenuItem>
        ) : null}

        {contribution.status === "PUBLISHED" ? (
          <DropdownMenuItem
            nativeButton={false}
            render={
              <Link href={`/notes/${contribution.slug}`} target="_blank">
                <HugeiconsIcon
                  icon={Link01Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="mr-2 size-4"
                />
                View Published Note
              </Link>
            }
          ></DropdownMenuItem>
        ) : null}

        {contribution.status === "PENDING_REVIEW" ? (
          <DropdownMenuItem onClick={() => onViewDetails(contribution)}>
            <HugeiconsIcon
              icon={Link01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="mr-2 size-4"
            />
            View Submission
          </DropdownMenuItem>
        ) : null}

        {contribution.status === "DRAFT" ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={isDeleting}
            >
              <HugeiconsIcon
                icon={Delete02Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="mr-2 size-4"
              />
              Delete Draft
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setDeleteOpen(open)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the draft &ldquo;{contribution.title}
              &rdquo; from your notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteDraft}
            >
              {isDeleting ? (
                <>
                  <Spinner /> Deleting...
                </>
              ) : (
                "Delete Draft"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DropdownMenu>
  )
}
