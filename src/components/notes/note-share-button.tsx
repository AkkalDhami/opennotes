"use client"

import toast from "react-hot-toast"
import { HugeiconsIcon } from "@hugeicons/react"
import { Share08Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { PublicNote } from "@/types/note"

interface NoteShareButtonProps {
  note: PublicNote
}

export function NoteShareButton({ note }: NoteShareButtonProps) {
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
    <Button variant="outline" onClick={handleShare} className="gap-2">
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
