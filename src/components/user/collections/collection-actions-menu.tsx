"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalIcon,
  Folder01Icon,
  FolderAddIcon,
  Edit02Icon,
  Delete02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Share08Icon,
  Copy01Icon,
  FolderTransferIcon,
  File01Icon,
  FolderLibraryIcon,
} from "@hugeicons/core-free-icons"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { CollectionRecord } from "@/lib/user/collection-queries"
import { duplicateCollection, moveCollection } from "@/lib/user/collections"
import { Route } from "next"
import { useModal } from "@/hooks/use-modal-store"

/**
 * Structural rather than `CollectionTreeNode`, so the same menu works for a tree
 * node, a plain row, and the child summaries the detail page renders.
 */
type MenuCollection = Pick<
  CollectionRecord,
  "id" | "name" | "slug" | "description" | "visibility" | "parentId"
>

export function CollectionActionsMenu({
  collection,
  siblingCount,
  siblingIndex,
}: {
  collection: MenuCollection
  siblingCount: number
  siblingIndex: number
}) {
  const router = useRouter()
  const [isMoving, startMoveTransition] = useTransition()
  const [isDuplicating, startDuplicateTransition] = useTransition()

  const { open } = useModal()

  const isPublic = collection.visibility === "PUBLIC"
  const isBusy = isMoving || isDuplicating

  /**
   * Single-step reorder. This is the keyboard and screen-reader path to the same
   * thing drag-and-drop does — the grip handle can't be operated without a
   * pointer, so these stay even though dragging exists.
   */
  function handleMove(direction: "up" | "down") {
    startMoveTransition(async () => {
      const result = await moveCollection({ id: collection.id, direction })
      if (!result.ok) toast.error(result.error)
      else router.refresh()
    })
  }

  function handleDuplicate(includeNotes: boolean) {
    startDuplicateTransition(async () => {
      const result = await duplicateCollection({
        id: collection.id,
        includeNotes,
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success(`Created "${result.data.name}"`)
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 opacity-100 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            aria-label={`More actions for ${collection.name}`}
          >
            {isBusy ? (
              <Spinner />
            ) : (
              <HugeiconsIcon
                icon={MoreVerticalIcon}
                size={18}
                color="currentColor"
                strokeWidth={2}
              />
            )}
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          render={
            <Link href={`/profile/collections/${collection.slug}` as Route}>
              <HugeiconsIcon
                icon={Folder01Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
              />
              Open collection
            </Link>
          }
        />

        <DropdownMenuItem
          onClick={() =>
            open("create-collection", {
              collectionFormDialog: {
                fixedParentId: collection.id,
                fixedParentName: collection.name,
              },
            })
          }
        >
          <HugeiconsIcon
            icon={FolderAddIcon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          Create subcollection
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            open("edit-collection", {
              editCollection: {
                description: collection.description,
                id: collection.id,
                name: collection.name,
                visibility: collection.visibility,
              },
            })
          }
        >
          <HugeiconsIcon
            icon={Edit02Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          Edit
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Re-parenting. Separate from Move up / Move down, which only shuffle
            a collection inside the siblings it already has. */}
        <DropdownMenuItem
          onClick={() =>
            open("move-collection", {
              moveCollection: {
                id: collection.id,
                name: collection.name,
                parentId: collection.parentId,
              },
            })
          }
        >
          <HugeiconsIcon
            icon={FolderTransferIcon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          Move to…
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={siblingIndex === 0 || isMoving}
          onClick={() => handleMove("up")}
        >
          <HugeiconsIcon
            icon={ArrowUp01Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          Move up
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={siblingIndex >= siblingCount - 1 || isMoving}
          onClick={() => handleMove("down")}
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          Move down
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* A submenu rather than a dialog: the only decision to make is whether
            the copy keeps its note memberships. */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={isDuplicating}>
            <HugeiconsIcon
              icon={Copy01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
            Duplicate
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent className="w-52">
            <DropdownMenuItem onClick={() => handleDuplicate(true)}>
              <HugeiconsIcon
                icon={File01Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
              />
              With its notes
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleDuplicate(false)}>
              <HugeiconsIcon
                icon={FolderLibraryIcon}
                size={16}
                color="currentColor"
                strokeWidth={2}
              />
              Folders only
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Only public collections get a share entry: a private collection's
            link 404s by design, so offering it would hand out a dead URL. */}
        {isPublic ? (
          <DropdownMenuItem
            onClick={() =>
              open("share-collection", {
                shareCollection: {
                  id: collection.id,
                  slug: collection.slug,
                  name: collection.name,
                  description: collection.description,
                  visibility: collection.visibility,
                },
              })
            }
          >
            <HugeiconsIcon
              icon={Share08Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
            Share
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            open("delete-collection", {
              deleteCollection: {
                id: collection.id,
                name: collection.name,
              },
            })
          }
        >
          <HugeiconsIcon
            icon={Delete02Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
