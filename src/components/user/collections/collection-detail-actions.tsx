"use client"

import { useTransition } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  Edit02Icon,
  FolderAddIcon,
  QrCodeIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/constants/app.constants"
import { useModal } from "@/hooks/use-modal-store"
import { useOrigin } from "@/hooks/use-origin"
import { notifyShareResult, useWebShare } from "@/hooks/use-web-share"
import type { CollectionRecord } from "@/lib/user/collection-queries"
import { buildCollectionShareUrl } from "@/lib/user/collection-share"

type DetailCollection = Pick<
  CollectionRecord,
  "id" | "name" | "slug" | "description" | "visibility"
>

export function CollectionDetailActions({
  collection,
}: {
  collection: DetailCollection
}) {
  const { open } = useModal()
  const origin = useOrigin()
  const { canShareLink, share } = useWebShare()
  const [isSharing, startSharing] = useTransition()

  const isPublic = collection.visibility === "PUBLIC"
  const shareUrl = origin ? buildCollectionShareUrl(origin, collection) : ""

  function handleDeviceShare() {
    startSharing(async () => {
      const result = await share({
        url: shareUrl,
        title: collection.name,
        text:
          collection.description ||
          `A collection of study notes on ${APP_NAME}.`,
      })
      notifyShareResult(result, { failed: "Couldn't share this collection" })
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
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
        New subcollection
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          open("edit-collection", {
            editCollection: {
              id: collection.id,
              name: collection.name,
              description: collection.description,
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
      </Button>

      {isPublic && canShareLink && (
        <Button
          variant="outline"
          disabled={!shareUrl || isSharing}
          onClick={handleDeviceShare}
        >
          <HugeiconsIcon
            icon={Share08Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          Share
        </Button>
      )}

      {isPublic && (
        <Button
          variant="outline"
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
            icon={QrCodeIcon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          Link &amp; QR
        </Button>
      )}

      <Button
        variant="destructive"
        aria-label={`Delete ${collection.name}`}
        onClick={() =>
          open("delete-collection", {
            deleteCollection: { id: collection.id, name: collection.name },
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
      </Button>
    </div>
  )
}
