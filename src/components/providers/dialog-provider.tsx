import { UpdateProfileDialog } from "@/components/dialogs/update-profile-dialog"
import { ReportNoteDialog } from "@/components/dialogs/report-note-dialog"

export function DialogProvider() {
  return (
    <>
      <UpdateProfileDialog />
      <ReportNoteDialog />
    </>
  )
}
