"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, Loading03Icon } from "@hugeicons/core-free-icons"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { removeReportedNote } from "@/lib/reports/remove-reported-note"

export function RemoveNoteButton({
  noteId,
  noteTitle,
}: {
  noteId: string
  noteTitle: string
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleConfirm() {
    startTransition(async () => {
      const result = await removeReportedNote({ noteId })

      if (result.success) {
        toast.success("Note removed.")
        setOpen(false)
        router.refresh()
        return
      }

      toast.error(result.message)
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <HugeiconsIcon
              icon={Delete02Icon}
              size={14}
              color="currentColor"
              strokeWidth={2}
              className="size-3.5"
            />
            Remove Note
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove &ldquo;{noteTitle}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This takes the note down from public access immediately. This is
            independent of the report&apos;s status — resolve or dismiss the
            report separately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={isPending}
            className="gap-2 bg-red-600 text-white hover:bg-red-600"
          >
            {isPending ? (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="size-4 animate-spin"
              />
            ) : null}
            Remove Note
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
