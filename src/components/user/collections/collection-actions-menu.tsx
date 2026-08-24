"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalIcon,
  Folder01Icon,
  Edit02Icon,
  Delete02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CollectionTreeNode } from "@/lib/user/collection-queries"
import { moveCollection } from "@/lib/user/collections"
import { Route } from "next"
import { useModal } from "@/hooks/use-modal-store"

export function CollectionActionsMenu({
  collection,
  siblingCount,
  siblingIndex,
}: {
  collection: CollectionTreeNode
  siblingCount: number
  siblingIndex: number
}) {
  const router = useRouter()
  const [isMoving, startMoveTransition] = useTransition()

  const { open } = useModal()

  function handleMove(direction: "up" | "down") {
    startMoveTransition(async () => {
      const result = await moveCollection({ id: collection.id, direction })
      if (!result.ok) toast.error(result.error)
      else router.refresh()
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-100 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
              aria-label={`More actions for ${collection.name}`}
            >
              <HugeiconsIcon
                icon={MoreVerticalIcon}
                size={18}
                color="currentColor"
                strokeWidth={2}
              />
            </Button>
          }
        ></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            render={
              <Link href={`/profile/collections/${collection.slug}` as Route}>
                <HugeiconsIcon
                  icon={Folder01Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                />
                Open Collection
              </Link>
            }
          ></DropdownMenuItem>
          {/* <DropdownMenuItem>
            <HugeiconsIcon
              icon={PlusSignIcon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
            Add Notes
          </DropdownMenuItem> */}
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
              icon={Folder01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
            Create Subcollection
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

          <DropdownMenuItem
            disabled={siblingIndex === 0 || isMoving}
            onSelect={() => handleMove("up")}
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
            disabled={siblingIndex === siblingCount - 1 || isMoving}
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

          <DropdownMenuItem>
            <HugeiconsIcon
              icon={Share08Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
            Share
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
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
    </>
  )
}
