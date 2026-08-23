import Link from "next/link"

import { Button } from "@/components/ui/button"

interface SavedNotesEmptyProps {
  query?: string
}

export function SavedNotesEmpty({ query }: SavedNotesEmptyProps) {
  if (query) {
    return (
      <EmptyState
        title="No saved notes found"
        description={`We couldn't find any saved notes matching "${query}". Try a different search term.`}
      />
    )
  }

  return (
    <EmptyState
      title="No saved notes yet"
      description="When you find something useful, save it here so you can easily come back to it later."
    >
      <Button
        nativeButton={false}
        render={<Link href="/notes">Browse Notes</Link>}
      >
        Browse Notes
      </Button>
    </EmptyState>
  )
}

function EmptyState({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-muted-foreground">{description}</p>

      {children}
    </div>
  )
}
