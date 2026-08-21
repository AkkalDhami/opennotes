"use client"

import { useTransition } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon } from "@hugeicons/core-free-icons"

interface DownloadNoteButtonProps {
  noteId: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
  children?: React.ReactNode
}

export function DownloadNoteButton({
  noteId,
  variant = "default",
  size,
  className,
  children,
}: DownloadNoteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDownload = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/notes/${noteId}/download?mode=file`)

        if (!response.ok) {
          const data = await response.json().catch(() => null)

          toast.error(data?.message ?? "Unable to download note.")
          return
        }

        const blob = await response.blob()

        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = "note.pdf"

        document.body.appendChild(link)
        link.click()
        link.remove()

        URL.revokeObjectURL(url)

        router.refresh()
      } catch {
        toast.error("Unable to download note.")
      }
    })
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isPending}
      className={cn("gap-2", className)}
    >
      {isPending ? (
        <>
          <Spinner />
          Downloading...
        </>
      ) : (
        (children ?? (
          <>
            <HugeiconsIcon
              icon={Download01Icon}
              size={16}
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />{" "}
            Download PDF
          </>
        ))
      )}
    </Button>
  )
}
