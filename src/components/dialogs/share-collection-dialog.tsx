/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState, useTransition } from "react"
import toast from "react-hot-toast"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckIcon,
  Copy01Icon,
  Download01Icon,
  IncognitoIcon,
  QrCodeIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode } from "@/components/shared/qr-code"
import { APP_NAME } from "@/constants/app.constants"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useModal } from "@/hooks/use-modal-store"
import { useOrigin } from "@/hooks/use-origin"
import { notifyShareResult, useWebShare } from "@/hooks/use-web-share"
import { generateQrWithCaptionDataUrl } from "@/lib/notes/qr"
import { buildCollectionShareUrl } from "@/lib/user/collection-share"
import { cn } from "@/lib/utils"

function qrFileName(name: string) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "collection"
  return `${base}-qr.png`
}

export function ShareCollectionDialog() {
  const { close, isOpen, type, data } = useModal()
  const isModalOpen = isOpen && type === "share-collection"

  const collection = data.shareCollection
  const origin = useOrigin()

  const [showQr, setShowQr] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { canShareLink, canShareFiles, share, shareFiles } = useWebShare()

  const { copy, state } = useCopyToClipboard({
    onCopySuccess: () => toast.success("Link copied to clipboard"),
    onCopyError: () => toast.error("Couldn't copy the link"),
  })

  // Collapse the QR between openings so the dialog always starts the same way.
  useEffect(() => {
    if (!isModalOpen) setShowQr(false)
  }, [isModalOpen])

  if (!collection) return null

  // Pulled into locals so the async handlers below don't have to re-narrow
  // `collection` (or lean on non-null assertions) inside their closures.
  const { name, description, visibility } = collection
  const isPublic = visibility === "PUBLIC"
  const shareUrl = origin ? buildCollectionShareUrl(origin, collection) : ""
  const fileName = qrFileName(name)
  const isCopied = state === "done"

  async function buildQrImage() {
    const dataUrl = await generateQrWithCaptionDataUrl({
      url: shareUrl,
      title: name,
      subtitle: APP_NAME,
    })
    const blob = await (await fetch(dataUrl)).blob()
    return { dataUrl, file: new File([blob], fileName, { type: "image/png" }) }
  }

  function handleDownloadQr() {
    startTransition(async () => {
      try {
        const { dataUrl } = await buildQrImage()
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        link.remove()
      } catch {
        toast.error("Failed to generate the QR code image.")
      }
    })
  }

  function handleNativeShare() {
    startTransition(async () => {
      const result = await share({
        url: shareUrl,
        title: name,
        text: description || `A collection of study notes on ${APP_NAME}.`,
      })
      notifyShareResult(result, { failed: "Couldn't share this collection" })
    })
  }

  function handleShareQrImage() {
    startTransition(async () => {
      try {
        const { file } = await buildQrImage()
        const result = await shareFiles({ files: [file], title: name })
        notifyShareResult(result, {
          unsupported: "This browser can't share images",
          failed: "Couldn't share the QR code",
        })
      } catch {
        toast.error("Couldn't share the QR code.")
      }
    })
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(openState) => {
        if (!openState) close()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share collection</DialogTitle>
          <DialogDescription>
            {isPublic ? (
              <>
                Anyone with this link can browse{" "}
                <strong className="font-medium text-foreground">{name}</strong>{" "}
                and the published notes inside it.
              </>
            ) : (
              <>
                <strong className="font-medium text-foreground">{name}</strong>{" "}
                is private, so this link won&apos;t open for anyone else yet.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!isPublic && (
          <div className="flex items-start gap-2.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm">
            <HugeiconsIcon
              icon={IncognitoIcon}
              size={18}
              color="currentColor"
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-500"
            />
            <p className="text-muted-foreground">
              Switch this collection&apos;s visibility to{" "}
              <strong className="font-medium text-foreground">Public</strong> in
              Edit collection, and the link starts working immediately.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={shareUrl}
            aria-label="Share link"
            onFocus={(event) => event.currentTarget.select()}
            className="font-mono text-xs"
          />
          <Button
            variant="outline"
            size="icon"
            aria-label="Copy link"
            disabled={!shareUrl}
            className={cn(isCopied && "text-green-500 hover:text-green-500")}
            onClick={() => copy(shareUrl)}
          >
            <HugeiconsIcon
              icon={isCopied ? CheckIcon : Copy01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
            />
          </Button>
        </div>

        {showQr && shareUrl && (
          <QrCode
            value={shareUrl}
            size={200}
            fileName={fileName}
            alt={`QR code linking to the ${name} collection`}
            showDownload={false}
          />
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            className="w-full"
            disabled={!shareUrl}
            onClick={() => setShowQr((previous) => !previous)}
          >
            <HugeiconsIcon
              icon={QrCodeIcon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
            />
            {showQr ? "Hide QR code" : "Generate QR code"}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            disabled={!showQr || isPending || !shareUrl}
            onClick={handleDownloadQr}
          >
            <HugeiconsIcon
              icon={Download01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
            />
            {isPending ? "Generating..." : "Download QR"}
          </Button>

          {canShareLink && (
            <Button
              className="w-full sm:col-span-2"
              disabled={!shareUrl}
              onClick={handleNativeShare}
            >
              <HugeiconsIcon
                icon={Share08Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
              Share via device
            </Button>
          )}

          {showQr && canShareFiles && (
            <Button
              variant="secondary"
              className="w-full sm:col-span-2"
              disabled={isPending || !shareUrl}
              onClick={handleShareQrImage}
            >
              <HugeiconsIcon
                icon={Share08Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
              {isPending ? "Preparing..." : "Share QR image"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
