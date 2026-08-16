// "use client"

// import { useTransition } from "react"
// import { toast } from "react-hot-toast"

// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import { downloadNote } from "@/lib/notes/download-note"
// import { Spinner } from "@/components/ui/spinner"

// interface DownloadNoteButtonProps {
//   noteId: string
//   variant?: React.ComponentProps<typeof Button>["variant"]
//   size?: React.ComponentProps<typeof Button>["size"]
//   className?: string
//   children?: React.ReactNode
// }

// export function DownloadNoteButton({
//   noteId,
//   variant = "brand",
//   size,
//   className,
//   children,
// }: DownloadNoteButtonProps) {
//   const [isPending, startTransition] = useTransition()

//   const handleDownload = () => {
//     startTransition(async () => {
//       const result = await downloadNote(noteId)

//       if (!result.success || !result.url) {
//         toast.error(result.message ?? "Unable to download note.")
//         return
//       }

//       const link = document.createElement("a")

//       link.href = result.url
//       link.download = result.fileName ?? "notes.pdf"
//       link.target = "_blank"
//       link.rel = "noopener noreferrer"

//       document.body.appendChild(link)
//       link.click()
//       link.remove()
//     })
//   }

//   return (
//     <Button
//       type="button"
//       variant={variant}
//       size={size}
//       onClick={handleDownload}
//       disabled={isPending}
//       className={cn(className)}
//     >
//       {isPending ? (
//         <>
//           <Spinner />
//           Downloading...
//         </>
//       ) : (
//         (children ?? "Download PDF")
//       )}
//     </Button>
//   )
// }

"use client"

import { useTransition } from "react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface DownloadNoteButtonProps {
  noteId: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
  children?: React.ReactNode
}

export function DownloadNoteButton({
  noteId,
  variant = "brand",
  size,
  className,
  children,
}: DownloadNoteButtonProps) {
  const [isPending, startTransition] = useTransition()

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
        (children ?? "Download PDF")
      )}
    </Button>
  )
}
