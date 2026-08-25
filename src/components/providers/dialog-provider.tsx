import { UpdateProfileDialog } from "@/components/dialogs/update-profile-dialog"
import { ReportNoteDialog } from "@/components/dialogs/report-note-dialog"
import { CreateCollectionDialog } from "@/components/dialogs/create-collection-dialog"
import { EditCollectionDialog } from "@/components/dialogs/edit-collection-dialog"
import { DeleteCollectionDialog } from "@/components/dialogs/delete-collection-dialog"
import { AddNoteToCollectionsDialog } from "@/components/dialogs/add-note-to-collections-dialog"
import { ShareCollectionDialog } from "@/components/dialogs/share-collection-dialog"
import { MoveCollectionDialog } from "@/components/dialogs/move-collection-dialog"
import { CollectionDetailsDialog } from "@/components/dialogs/collection-details-dialog"

export function DialogProvider() {
  return (
    <>
      <UpdateProfileDialog />
      <ReportNoteDialog />
      <CreateCollectionDialog />
      <EditCollectionDialog />
      <DeleteCollectionDialog />
      <AddNoteToCollectionsDialog />
      <ShareCollectionDialog />
      <MoveCollectionDialog />
      <CollectionDetailsDialog />
    </>
  )
}
