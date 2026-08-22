import { notFound } from "next/navigation"
import Link from "next/link"
import { requireAdmin } from "@/lib/auth/require-admin"
import {
  getAdminContributionById,
  getContributorStats,
} from "@/lib/notes/queries"
import { resolveNoteFileUrl } from "@/lib/notes/file-url"
import { ContributionDetail } from "@/components/admin/contributions/contribution-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { DashboardContainer } from "@/components/ui/dashboard-container"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminContributionDetailPage({
  params,
}: PageProps) {
  await requireAdmin()

  const { id } = await params

  const note = await getAdminContributionById(id)

  // console.log({ note, id })

  if (!note) {
    notFound()
  }

  const [contributorStats, fileUrl] = await Promise.all([
    getContributorStats(note.contributor.id),
    resolveNoteFileUrl(note.fileKey),
  ])

  return (
    <DashboardContainer>
      <Button
        variant="secondary"
        size="sm"
        nativeButton={false}
        className="w-fit"
        render={
          <Link href="/admin/contributions">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={16}
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />
            Back to contributions
          </Link>
        }
      ></Button>

      <ContributionDetail
        note={note}
        contributorStats={contributorStats}
        fileUrl={fileUrl}
      />
    </DashboardContainer>
  )
}
