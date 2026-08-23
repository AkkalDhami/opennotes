import { UpdateProfileDialog } from "@/components/dialogs/update-profile-dialog"
import { ReportNoteDialog } from "@/components/dialogs/report-note-dialog"
import { CreateCollectionDialog } from "@/components/dialogs/create-collection-dialog"

export function DialogProvider() {
  return (
    <>
      <UpdateProfileDialog />
      <ReportNoteDialog />
      <CreateCollectionDialog />
    </>
  )
}
