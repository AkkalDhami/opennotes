/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, File01Icon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  addNotesToCollection,
  searchAddableNotes,
} from "@/lib/user/collections"

type AddableNote = { id: string; title: string; subject?: string | null }

export function AddNotesDialog({
  open,
  onOpenChange,
  collectionId,
  collectionName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  collectionName: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AddableNote[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isSearching, setIsSearching] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setIsSearching(true)
    const handle = setTimeout(async () => {
      const result = await searchAddableNotes({ collectionId, query })
      if (result.ok) setResults(result.data as AddableNote[])
      setIsSearching(false)
    }, 250)
    return () => clearTimeout(handle)
  }, [open, query, collectionId])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      setSelected(new Set())
    }
  }, [open])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSubmit() {
    if (selected.size === 0) return
    startTransition(async () => {
      const result = await addNotesToCollection({
        collectionId,
        noteIds: [...selected],
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(
        `Added ${selected.size} note${selected.size === 1 ? "" : "s"} to "${collectionName}"`
      )
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add notes to &quot;{collectionName}&quot;</DialogTitle>
          <DialogDescription>
            A note can belong to more than one collection — adding it here
            won&apos;t remove it from anywhere else.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            color="currentColor"
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your notes..."
            aria-label="Search notes to add"
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="max-h-72 overflow-y-auto rounded-md border border-border">
          {isSearching ? (
            <div className="p-4 text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No notes found.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((note) => (
                <li key={note.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/40">
                    <Checkbox
                      checked={selected.has(note.id)}
                      onCheckedChange={() => toggle(note.id)}
                    />
                    <HugeiconsIcon
                      icon={File01Icon}
                      size={16}
                      color="currentColor"
                      strokeWidth={2}
                      className="shrink-0 text-muted-foreground"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {note.title}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selected.size === 0 || isPending}
          >
            Add {selected.size > 0 ? selected.size : ""} note
            {selected.size === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
