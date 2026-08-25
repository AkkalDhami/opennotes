"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

/**
 * What actually happened, so call sites can stay quiet when the user simply
 * closed the share sheet.
 *
 * - `shared` — handed off to the OS successfully
 * - `dismissed` — the user closed the sheet (Web Share throws `AbortError`)
 * - `copied` — no Web Share here, so the link went to the clipboard instead
 * - `unsupported` — nothing we could do on this device
 * - `failed` — something went wrong
 */
export type WebShareResult =
  "shared" | "dismissed" | "copied" | "unsupported" | "failed"

type ShareLinkPayload = {
  url: string
  title?: string
  text?: string
}

type ShareFilesPayload = {
  files: File[]
  title?: string
  text?: string
}

function isAbort(error: unknown) {
  return error instanceof Error && error.name === "AbortError"
}

/**
 * The browser's native share sheet, with a clipboard fallback.
 *
 * Capabilities are read after mount rather than during render: `navigator.share`
 * only exists on secure origins and mostly on mobile, and `navigator.canShare`
 * (needed before sharing a *file* rather than a URL) is newer still — so a
 * server-rendered "Share via device" button would disagree with the client on
 * most desktops and hydrate wrong.
 */
export function useWebShare() {
  const [canShareLink, setCanShareLink] = useState(false)
  const [canShareFiles, setCanShareFiles] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    if (typeof navigator === "undefined") return
    const hasShare = typeof navigator.share === "function"
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanShareLink(hasShare)

    setCanShareFiles(hasShare && typeof navigator.canShare === "function")
  }, [])

  const share = useCallback(
    async (payload: ShareLinkPayload): Promise<WebShareResult> => {
      if (!payload.url) return "unsupported"

      if (typeof navigator !== "undefined" && canShareLink) {
        setIsSharing(true)
        try {
          await navigator.share({
            title: payload.title,
            text: payload.text,
            url: payload.url,
          })
          return "shared"
        } catch (error) {
          return isAbort(error) ? "dismissed" : "failed"
        } finally {
          setIsSharing(false)
        }
      }

      // Desktop Chrome and Firefox have no share sheet. Putting the link on the
      // clipboard is the same end result in one fewer step, so the button is
      // still worth showing.
      try {
        await navigator.clipboard.writeText(payload.url)
        return "copied"
      } catch {
        return "unsupported"
      }
    },
    [canShareLink]
  )

  const shareFiles = useCallback(
    async (payload: ShareFilesPayload): Promise<WebShareResult> => {
      if (payload.files.length === 0) return "unsupported"
      if (typeof navigator === "undefined" || !canShareFiles) {
        return "unsupported"
      }
      if (!navigator.canShare({ files: payload.files })) return "unsupported"

      setIsSharing(true)
      try {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          files: payload.files,
        })
        return "shared"
      } catch (error) {
        return isAbort(error) ? "dismissed" : "failed"
      } finally {
        setIsSharing(false)
      }
    },
    [canShareFiles]
  )

  return { canShareLink, canShareFiles, isSharing, share, shareFiles }
}

/**
 * Shared toast copy for a share attempt. `shared` and `dismissed` stay silent —
 * the OS sheet is its own feedback, and closing it isn't an error.
 */
export function notifyShareResult(
  result: WebShareResult,
  labels: { copied?: string; unsupported?: string; failed?: string } = {}
) {
  switch (result) {
    case "copied":
      toast.success(labels.copied ?? "Link copied to clipboard")
      break
    case "unsupported":
      toast.error(
        labels.unsupported ?? "Sharing isn't available on this device"
      )
      break
    case "failed":
      toast.error(labels.failed ?? "Couldn't share that")
      break
    default:
      break
  }
}
