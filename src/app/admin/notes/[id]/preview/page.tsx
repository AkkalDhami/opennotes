import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { PrivateNotePreview } from "@/components/notes/private-note-preview"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"
import { db, notes } from "@/db"

export default async function AdminNotePreviewPage(
  props: PageProps<"/admin/notes/[id]/preview">
) {
  const { id } = await props.params
  const [note] = await db
    .select({ id: notes.id, title: notes.title })
    .from(notes)
    .where(eq(notes.id, id))
    .limit(1)

  if (!note) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Heading>Preview note</Heading>
        <SubHeading>
          This private preview is available to administrators and the
          note&apos;s contributor.
        </SubHeading>
      </div>
      <PrivateNotePreview noteId={note.id} title={note.title} />
    </div>
  )
}
