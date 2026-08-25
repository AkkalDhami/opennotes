/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { CollectionParentPicker } from "@/components/user/collections/collection-parent-picker"
import { useModal } from "@/hooks/use-modal-store"
import {
  getCollectionMoveTargets,
  moveCollectionToParent,
} from "@/lib/user/collections"
import type { CollectionTreeNode } from "@/lib/user/collection-queries"

export function MoveCollectionDialog() {
  const router = useRouter()
  const { close, isOpen, type, data } = useModal()
  const isModalOpen = isOpen && type === "move-collection"

  const collection = data.moveCollection

  const [tree, setTree] = useState<CollectionTreeNode[]>([])
  const [blockedIds, setBlockedIds] = useState<string[]>([])
  const [currentParentId, setCurrentParentId] = useState<string | null>(null)
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Targets are loaded per open rather than passed in: the valid set depends on
  // the live tree, which can change between openings (and after a duplicate).
  useEffect(() => {
    if (!isModalOpen || !collection) return

    let cancelled = false
    setIsLoading(true)
    setLoadError(null)

    getCollectionMoveTargets({ collectionId: collection.id })
      .then((result) => {
        if (cancelled) return
        if (!result.ok) {
          setLoadError(result.error)
          return
        }
        setTree(result.data.tree)
        setBlockedIds(result.data.blockedIds)
        setCurrentParentId(result.data.currentParentId)
        setSelectedParentId(result.data.currentParentId)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, collection?.id])

  const blockedIdSet = useMemo(() => new Set(blockedIds), [blockedIds])
  const hasChanged = selectedParentId !== currentParentId

  function handleClose() {
    close()
    setTree([])
    setBlockedIds([])
    setCurrentParentId(null)
    setSelectedParentId(null)
    setLoadError(null)
  }

  function handleMove() {
    if (!collection || !hasChanged) return

    startTransition(async () => {
      const result = await moveCollectionToParent({
        id: collection.id,
        parentId: selectedParentId,
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success(
        selectedParentId
          ? `"${collection.name}" was moved`
          : `"${collection.name}" was moved to the top level`
      )
      handleClose()
      router.refresh()
    })
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(openState) => {
        if (!openState) handleClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move collection</DialogTitle>
          <DialogDescription>
            Choose a new home for{" "}
            <strong className="font-medium text-foreground">
              {collection?.name}
            </strong>
            . Its subcollections and notes move with it.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Spinner /> Loading collections...
          </div>
        ) : loadError ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {loadError}
          </p>
        ) : (
          <CollectionParentPicker
            nodes={tree}
            value={selectedParentId}
            onChange={setSelectedParentId}
            disabledIds={blockedIdSet}
            disabledLabel="Can't move here"
            topLevelDescription="Move it out to the top of your library"
            topLevelSummary="Will move to the top level"
            nestedSummaryPrefix="Will move under"
            emptyLabel="You don't have any other collections to move this into."
          />
        )}

        <DialogFooter>
          <Button variant="outline" disabled={isPending} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={isPending || isLoading || !hasChanged}
            onClick={handleMove}
          >
            {isPending ? (
              <>
                <Spinner /> Moving...
              </>
            ) : (
              "Move Collection"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
