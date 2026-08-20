import { AdminNotesSkeleton } from "@/components/admin/notes/admin-notes-skeleton"

export default function AdminNotesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="space-y-1">
        <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-border bg-muted/40"
          />
        ))}
      </div>
      <div className="h-32 animate-pulse rounded-lg border border-border bg-muted/40" />
      <AdminNotesSkeleton />
    </div>
  )
}
