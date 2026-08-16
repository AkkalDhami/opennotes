"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, QrCodeIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { generateNoteQrDataUrl } from "@/lib/notes/qr"

interface QrCodeProps {
  value: string
  fileName?: string
  alt?: string
  size?: number
  showDownload?: boolean
}

export function QrCode({
  value,
  fileName = "qr-code.png",
  alt = "QR code",
  size = 240,
  showDownload = true,
}: QrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDataUrl(null)
    setError(false)

    generateNoteQrDataUrl(value)
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [value])

  function handleDownload() {
    if (!dataUrl) return

    const link = document.createElement("a")
    link.href = dataUrl
    link.download = fileName
    link.click()
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Couldn&#39;t generate a QR code right now.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt={alt}
          width={size}
          height={size}
          className="rounded-lg border bg-white p-3"
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center rounded-lg border"
        >
          <div className="flex flex-col items-center gap-2">
            <HugeiconsIcon
              icon={QrCodeIcon}
              size={24}
              color="currentColor"
              strokeWidth={2}
              className="text-muted-foreground"
            />
            <span className="text-sm text-muted-foreground">Generating...</span>
          </div>
        </div>
      )}

      {showDownload && (
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={!dataUrl}
          className="w-full gap-2"
        >
          <HugeiconsIcon
            icon={Download01Icon}
            size={16}
            color="currentColor"
            strokeWidth={2}
            className="size-4"
          />
          Download QR
        </Button>
      )}
    </div>
  )
}
