interface PrivateNotePreviewProps {
  noteId: string
  title: string
}

export function PrivateNotePreview({ noteId, title }: PrivateNotePreviewProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <iframe
        src={`/api/notes/${noteId}/preview`}
        title={`${title} — PDF preview`}
        className="h-[75vh] min-h-105 w-full"
      />
    </div>
  )
}
