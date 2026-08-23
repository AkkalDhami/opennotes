"use client"

import { addBookmark, removeBookmark } from "@/lib/user/bookmarks"
import { cn } from "@/lib/utils"
import { HeartIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState, useTransition } from "react"
import { toast } from "react-hot-toast"

interface BookmarkButtonProps {
  noteId: string
  initialBookmarked: boolean
  className?: string
  children?: React.ReactNode
  size?: string
}

export function BookmarkButton({
  noteId,
  initialBookmarked,
  className,
  size = "size-5",
  children,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  function handleBookmark() {
    const previousState = bookmarked
    const nextState = !previousState

    // Optimistic UI
    setBookmarked(nextState)

    startTransition(async () => {
      const result = nextState
        ? await addBookmark(noteId)
        : await removeBookmark(noteId)

      if (!result.success) {
        // Roll back if server action failed
        setBookmarked(previousState)

        toast.error(result.message || "Something went wrong.")
        return
      }

      // Keep UI synchronized with server
      setBookmarked(result.bookmarked ?? false)
    })
  }

  return (
    <button
      type="button"
      onClick={handleBookmark}
      disabled={isPending}
      aria-label={bookmarked ? "Remove from bookmarks" : "Save for later"}
      aria-pressed={bookmarked}
      className={cn(
        "absolute top-4 right-4 z-10",
        "flex items-center gap-2",
        className
      )}
    >
      {children ?? (
        <>
          <HugeiconsIcon
            icon={HeartIcon}
            size={24}
            color="currentColor"
            strokeWidth={2}
            className={cn(
              "text-muted-foreground",
              "hover:fill-primary hover:text-primary",
              bookmarked && "fill-primary text-primary",
              size
            )}
          />

          <span className="sr-only">
            {bookmarked ? "Remove from bookmarks" : "Save for later"}
          </span>
        </>
      )}
    </button>
  )
}
