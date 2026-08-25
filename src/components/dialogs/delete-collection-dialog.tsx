"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteCollection } from "@/lib/user/collections"
import { useModal } from "@/hooks/use-modal-store"
import { Spinner } from "@/components/ui/spinner"

export function DeleteCollectionDialog() {
  const router = useRouter()
  const { close, isOpen, type, data } = useModal()
  const isModalOpen = isOpen && type === "delete-collection"

  const [isPending, startTransition] = useTransition()

  const deleteCollectionData = data.deleteCollection

  function handleDelete() {
    if (!deleteCollectionData) return
    startTransition(async () => {
      const result = await deleteCollection({
        id: deleteCollectionData?.id,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`Collection "${deleteCollectionData?.name}" was deleted`)
      close()
      router.refresh()

      router.push("/profile/collections")
    })
  }

  function handleClose() {
    close()
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(openState) => {
        if (!openState) {
          handleClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete collection?</DialogTitle>
          <DialogDescription>
            This will delete{" "}
            <strong className="font-medium text-foreground">
              {deleteCollectionData?.name}
            </strong>
            . The notes themselves will not be deleted. Any subcollections
            inside it will be deleted too.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose()}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner /> Deleting...
              </>
            ) : (
              " Delete Collection"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
