import { and, eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { PrivateNotePreview } from "@/components/notes/private-note-preview"
import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { db, notes } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export default async function ContributionPreviewPage(
  props: PageProps<"/profile/contributions/[id]/preview">
) {
  const [{ id }, user] = await Promise.all([props.params, getCurrentUser()])

  if (!user) {
    notFound()
  }

  const [note] = await db
    .select({ id: notes.id, title: notes.title })
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.contributorId, user.id)))
    .limit(1)

  if (!note) {
    notFound()
  }

  return (
    <DashboardContainer>
      <PageHeader
        title="Preview contribution"
        description="Only you and administrators can view this unpublished note."
      />
      <PrivateNotePreview noteId={note.id} title={note.title} />
    </DashboardContainer>
  )
}
