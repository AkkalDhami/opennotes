"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

import { useModal } from "@/hooks/use-modal-store"
import {
  addNoteToCollections,
  getCollectionPickerData,
} from "@/lib/user/collection-notes"
import { CollectionTreeNode } from "@/lib/user/collection-queries"
import {
  collectAncestorIds,
  filterCollectionTree,
  flattenCollectionTree,
} from "@/lib/user/collection-tree-search"
import { CreateCollectionInlineForm } from "@/components/user/collections/create-collection-inline-form"
import { CollectionPickerTree } from "@/components/user/collections/collection-picker-tree"

const AddToCollectionsFormSchema = z.object({
  collectionIds: z.array(z.uuid()).min(1, "Select at least one collection"),
})
type AddToCollectionsFormValues = z.infer<typeof AddToCollectionsFormSchema>

export function AddNoteToCollectionsDialog() {
  const router = useRouter()
  const { close, isOpen, type, data } = useModal()

  const isModalOpen = isOpen && type === "add-note-to-collections"
  const { noteId, noteTitle } = data.addNoteToCollectionsDialog ?? {}

  const [isSubmitting, startSubmitTransition] = useTransition()
  const [isLoadingPicker, setIsLoadingPicker] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [tree, setTree] = useState<CollectionTreeNode[]>([])
  const [alreadyAddedIds, setAlreadyAddedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [manualExpandIds, setManualExpandIds] = useState<Set<string>>(new Set())

  const form = useForm<AddToCollectionsFormValues>({
    resolver: zodResolver(AddToCollectionsFormSchema),
    defaultValues: { collectionIds: [] },
  })

  async function fetchPickerData() {
    if (!noteId) return null
    setIsLoadingPicker(true)
    setLoadError(null)

    const result = await getCollectionPickerData({ noteId })

    setIsLoadingPicker(false)

    if (!result.ok) {
      setLoadError(result.error)
      return null
    }

    setTree(result.data.tree)
    setAlreadyAddedIds(new Set(result.data.noteCollectionIds))
    return result.data
  }

  // Load fresh picker data every time the dialog opens for a note, since
  // collection membership can change between opens.
  useEffect(() => {
    if (isModalOpen && noteId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPickerData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, noteId])

  const { tree: visibleTree, expandIds: searchExpandIds } = useMemo(
    () => filterCollectionTree(tree, search),
    [tree, search]
  )

  const forceExpandIds = useMemo(() => {
    const combined = new Set(searchExpandIds)
    manualExpandIds.forEach((id) => combined.add(id))
    return combined
  }, [searchExpandIds, manualExpandIds])

  const parentOptions = useMemo(() => flattenCollectionTree(tree), [tree])

  const selectedIds = useWatch({
    control: form.control,
    name: "collectionIds",
  })
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedCount = selectedIds.length

  function handleToggle(node: CollectionTreeNode) {
    if (alreadyAddedIds.has(node.id)) return

    const current = form.getValues("collectionIds")
    const next = current.includes(node.id)
      ? current.filter((id) => id !== node.id)
      : [...current, node.id]

    form.setValue("collectionIds", next, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  async function handleCollectionCreated(created: {
    id: string
    parentId: string | null
  }) {
    setIsCreating(false)

    const fresh = await fetchPickerData()
    if (fresh) {
      const ancestors = collectAncestorIds(fresh.tree, created.id)
      setManualExpandIds((prev) => new Set([...prev, ...ancestors]))
    }

    form.setValue(
      "collectionIds",
      [...form.getValues("collectionIds"), created.id],
      { shouldValidate: true, shouldDirty: true }
    )
  }

  function handleClose() {
    close()
    setSearch("")
    setIsCreating(false)
    setTree([])
    setAlreadyAddedIds(new Set())
    setManualExpandIds(new Set())
    setLoadError(null)
    form.reset({ collectionIds: [] })
  }

  function handleSubmit(values: AddToCollectionsFormValues) {
    if (!noteId) return

    startSubmitTransition(async () => {
      const result = await addNoteToCollections({
        noteId,
        collectionIds: values.collectionIds,
      })

      if (!result.ok) {
        toast.error(
          result.error ||
            "We couldn't add this note to the selected collections. Please try again."
        )
        return
      }

      const { addedCount, alreadyExistingCount } = result.data
      const addedMessage = `Note added to ${addedCount} ${
        addedCount === 1 ? "collection" : "collections"
      }`

      if (alreadyExistingCount > 0) {
        toast.success(
          `${addedMessage}. ${alreadyExistingCount} ${
            alreadyExistingCount === 1 ? "collection" : "collections"
          } already contained this note.`
        )
      } else {
        toast.success(addedMessage)
      }

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
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          id="add-note-to-collections-form"
          className="flex min-h-0 flex-1 flex-col"
        >
          <FieldGroup className="min-h-0 flex-1 gap-4">
            <DialogHeader>
              <DialogTitle>Add to collections</DialogTitle>
              <DialogDescription>
                {noteTitle
                  ? `Choose collections to add "${noteTitle}" to.`
                  : "Choose collections to add this note to."}
              </DialogDescription>
            </DialogHeader>

            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                size={18}
                color="currentColor"
                strokeWidth={2}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collections..."
                aria-label="Search collections"
                className="pl-9"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border">
              {isLoadingPicker ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                  <Spinner /> Loading collections...
                </div>
              ) : loadError ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  {loadError}
                </div>
              ) : tree.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No collections yet.
                    <br />
                    Create a collection to organize your notes.
                  </p>
                  {!isCreating && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setIsCreating(true)}
                    >
                      <HugeiconsIcon
                        icon={PlusSignIcon}
                        size={16}
                        color="currentColor"
                        strokeWidth={2}
                      />
                      Create collection
                    </Button>
                  )}
                  {isCreating && (
                    <div className="w-full text-left">
                      <CreateCollectionInlineForm
                        parentOptions={parentOptions}
                        onCreated={handleCollectionCreated}
                        onCancel={() => setIsCreating(false)}
                      />
                    </div>
                  )}
                </div>
              ) : visibleTree.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No collections match &ldquo;{search}&rdquo;.
                </div>
              ) : (
                <div className="p-2">
                  <CollectionPickerTree
                    nodes={visibleTree}
                    selectedIds={selectedIdSet}
                    alreadyAddedIds={alreadyAddedIds}
                    forceExpandIds={forceExpandIds}
                    onToggle={handleToggle}
                  />
                </div>
              )}
            </div>

            {tree.length > 0 && (
              <div>
                {!isCreating ? (
                  <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
                  >
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      size={16}
                      color="currentColor"
                      strokeWidth={2}
                    />
                    Create new collection
                  </button>
                ) : (
                  <CreateCollectionInlineForm
                    parentOptions={parentOptions}
                    onCreated={handleCollectionCreated}
                    onCancel={() => setIsCreating(false)}
                  />
                )}
              </div>
            )}

            {form.formState.errors.collectionIds && (
              <FieldError>
                {form.formState.errors.collectionIds.message}
              </FieldError>
            )}
          </FieldGroup>

          <DialogFooter className="mt-4 flex items-center justify-between gap-3 sm:justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedCount === 0
                ? "No collections selected"
                : `${selectedCount} ${
                    selectedCount === 1 ? "collection" : "collections"
                  } selected`}
            </span>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleClose}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="add-note-to-collections-form"
                disabled={
                  isSubmitting || selectedCount === 0 || isLoadingPicker
                }
              >
                {isSubmitting ? (
                  <>
                    <Spinner /> Adding...
                  </>
                ) : selectedCount === 0 ? (
                  "Add"
                ) : (
                  `Add to ${selectedCount}`
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
