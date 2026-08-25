"use client"

import toast from "react-hot-toast"
import { HugeiconsIcon } from "@hugeicons/react"
import { Share08Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { PublicNote } from "@/types/note"
import { cn } from "@/lib/utils"

interface NoteShareButtonProps {
  note: PublicNote
  className?: string
}

export function NoteShareButton({ note, className }: NoteShareButtonProps) {
  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: `Check out ${note.title} on OpenNotes`,
          url,
        })
      } catch (error) {
        // AbortError is thrown when the user cancels the share sheet — not an error.
        if ((error as DOMException)?.name !== "AbortError") {
          toast.error("Couldn't share this note.")
        }
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied!")
    } catch {
      toast.error("Couldn't copy the link.")
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={cn("w-full gap-2", className)}
    >
      <HugeiconsIcon
        icon={Share08Icon}
        size={16}
        color="currentColor"
        strokeWidth={2}
        className="size-4"
      />
      Share
    </Button>
  )
}
