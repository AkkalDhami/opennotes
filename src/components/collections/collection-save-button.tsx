"use client"
import { useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Bookmark01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { toggleSaveCollection } from "@/lib/collections/collection-actions"
import { Route } from "next"

export function CollectionSaveButton({
  collectionId,
  initialSaved,
}: {
  collectionId: string
  initialSaved: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [saved, setSaved] = useOptimistic(
    initialSaved,
    (_, next: boolean) => next
  )

  function onClick() {
    start(async () => {
      setSaved(!saved)
      const res = await toggleSaveCollection(collectionId)
      if (!res.ok && res.reason === "unauthenticated")
        router.push(
          `/signin?next=${encodeURIComponent(location.pathname)}` as Route
        )
      else router.refresh()
    })
  }
  return (
    <Button
      onClick={onClick}
      disabled={pending}
      variant={saved ? "secondary" : "default"}
      className="gap-2"
      aria-pressed={saved}
    >
      <motion.span
        key={String(saved)}
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <HugeiconsIcon
          icon={Bookmark01Icon}
          size={16}
          color="currentColor"
          strokeWidth={2}
          className="size-4"
        />
      </motion.span>
      {saved ? "Saved" : "Save collection"}
    </Button>
  )
}
