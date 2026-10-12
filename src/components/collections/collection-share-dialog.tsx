"use client"
import { useRef, useState, useSyncExternalStore } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Share08Icon,
  Copy01Icon,
  Tick02Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "react-hot-toast"

export function CollectionShareDialog({
  name,
  url,
}: {
  name: string
  url: string
}) {
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const canShare = useSyncExternalStore(
    () => () => {},
    () => !!navigator.share,
    () => false
  )

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Link copied")
    setTimeout(() => setCopied(false), 1800)
  }
  function downloadQr() {
    const svg = qrRef.current?.querySelector("svg")
    if (!svg) return
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
      type: "image/svg+xml",
    })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `${name.toLowerCase().replace(/\s+/g, "-")}-qr.svg`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="group gap-2"
            aria-label="Share collection"
          >
            <HugeiconsIcon
              icon={Share08Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
            Share collection
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share this collection</DialogTitle>
          <DialogDescription>
            Share with your classmates and friends. Anyone with the link can
            view this collection.
          </DialogDescription>
        </DialogHeader>
        <div ref={qrRef} className="mx-auto rounded-xl border bg-white p-6">
          {/* <QRCodeSVG
            value={url}
            size={240}
            marginSize={0}
            level="M"
            className="size-[min(60vw,240px)]"
          /> */}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Scan to open this collection
        </p>
        <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
          <button onClick={copy} aria-label="Copy link" className="shrink-0">
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
            />
          </button>
        </div>
        <div className="flex gap-2">
          <Button onClick={copy} className="flex-1">
            {copied ? "Copied" : "Copy link"}
          </Button>
          {canShare && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                navigator
                  .share({
                    title: name,
                    text: "Check out this collection on OpenNotes",
                    url,
                  })
                  .catch(() => {})
              }
            >
              Share
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={downloadQr}
          className="gap-2"
        >
          <HugeiconsIcon
            icon={Download01Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
            className="size-4"
          />
          Download QR code
        </Button>
      </DialogContent>
    </Dialog>
  )
}
