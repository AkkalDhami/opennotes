import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { ContributionForm } from "@/components/contributions/contribution-form"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"
import { db, notes } from "@/db"

export default async function AdminEditNotePage(
  props: PageProps<"/admin/notes/[id]/edit">
) {
  const { id } = await props.params
  const [note] = await db
    .select({
      id: notes.id,
      title: notes.title,
      description: notes.description,
      subject: notes.subject,
      category: notes.category,
      educationLevel: notes.educationLevel,
      course: notes.course,
      grade: notes.grade,
      topic: notes.topic,
      academicYear: notes.academicYear,
      tags: notes.tags,
      sourceType: notes.sourceType,
      originalAuthor: notes.originalAuthor,
      sourceUrl: notes.sourceUrl,
    })
    .from(notes)
    .where(eq(notes.id, id))
    .limit(1)

  if (!note) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Heading>Edit note</Heading>
        <SubHeading>
          Update this contribution&apos;s details. Its moderation status and PDF
          will remain unchanged.
        </SubHeading>
      </div>
      <ContributionForm
        adminEdit
        contributionId={note.id}
        initialValues={{
          title: note.title,
          description: note.description ?? "",
          subject: note.subject,
          category: note.category,
          educationLevel: note.educationLevel,
          course: note.course ?? "",
          grade: note.grade ?? "",
          topic: note.topic ?? "",
          academicYear: note.academicYear ?? "",
          tags: note.tags?.join(", ") ?? "",
          sourceType: note.sourceType,
          originalAuthor: note.originalAuthor ?? "",
          sourceUrl: note.sourceUrl ?? "",
          shareConfirmation: true,
        }}
      />
    </div>
  )
}
