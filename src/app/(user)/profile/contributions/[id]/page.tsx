import { and, eq, inArray } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"

import { ContributionForm } from "@/components/contributions/contribution-form"
import { PageHeader } from "@/components/shared/page-header"
import { DashboardContainer } from "@/components/ui/dashboard-container"
import { db, notes } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { EDITABLE_NOTE_STATUSES } from "@/app/api/notes/[id]/contribution/route"

export const metadata = {
  title: "Edit contribution",
  description: "Update your contribution and submit it for review.",
}

export default async function EditContributionPage(
  props: PageProps<"/profile/contributions/[id]">
) {
  const [{ id }, currentUser] = await Promise.all([
    props.params,
    getCurrentUser(),
  ])

  if (!currentUser) {
    notFound()
  }

  const [contribution] = await db
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
      status: notes.status,
      sourceType: notes.sourceType,
      originalAuthor: notes.originalAuthor,
      sourceUrl: notes.sourceUrl,
    })
    .from(notes)
    .where(
      and(
        eq(notes.id, id),
        eq(notes.contributorId, currentUser.id),
        inArray(notes.status, EDITABLE_NOTE_STATUSES)
      )
    )
    .limit(1)

  if (!contribution) {
    redirect("/profile/dashboard")
  }

  return (
    <DashboardContainer>
      <PageHeader
        title="Edit contribution"
        description="Update your note and submit it for review. The existing PDF will be kept."
      />
      <ContributionForm
        contributionId={contribution.id}
        initialValues={{
          title: contribution.title,
          description: contribution.description ?? "",
          subject: contribution.subject,
          category: contribution.category,
          educationLevel: contribution.educationLevel,
          course: contribution.course ?? "",
          grade: contribution.grade ?? "",
          topic: contribution.topic ?? "",
          academicYear: contribution.academicYear ?? "",
          tags: contribution.tags?.join(", ") ?? "",
          sourceType: contribution.sourceType,
          originalAuthor: contribution.originalAuthor ?? "",
          sourceUrl: contribution.sourceUrl ?? "",
          shareConfirmation: true,
        }}
        initialStatus={contribution.status}
      />
    </DashboardContainer>
  )
}
