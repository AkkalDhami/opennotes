"use client"

import { useTransition } from "react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { downloadNote } from "@/lib/notes/download-note"

export function DownloadNoteButton({ noteId }: { noteId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDownload = () => {
    startTransition(async () => {
      const result = await downloadNote(noteId)

      if (!result.success || !result.url) {
        toast.error(result.message ?? "Unable to download note.")
        return
      }

      // Start the actual download
      const link = document.createElement("a")
      link.href = result.url
      link.download = result.fileName ?? "notes.pdf"
      link.target = "_blank"

      document.body.appendChild(link)
      link.click()
      link.remove()
    })
  }

  return (
    <Button onClick={handleDownload} disabled={isPending} variant={"brand"}>
      {isPending ? "Preparing..." : "Download PDF"}
    </Button>
  )
}
