import { CollectionRecord } from "@/lib/user/collection-queries"
import { UserType } from "@/types/auth"
import { UpdateNoteFormValues } from "@/validations/note"
import { create } from "zustand"
import { devtools } from "zustand/middleware"

export type ModalType =
  | "update-profile"
  | "update-note"
  | "report-note"
  | "create-collection"
  | "edit-collection"
  | "delete-collection"
  | "add-note-to-collections"
  | "share-collection"
  | "move-collection"
  | "collection-details"

export type CollectionParentOption = {
  id: string
  name: string
  parentId: string | null
}

export type CollectionFormDialogType = {
  collection?: CollectionRecord
  fixedParentId?: string
  fixedParentName?: string
  parentOptions?: CollectionParentOption[]
}

export type AddNoteToCollectionsDialogType = {
  noteId: string
  noteTitle: string
}

/**
 * Everything the share dialog needs to build a link without another round trip.
 * `visibility` is carried so the dialog can explain itself if it's ever opened
 * for a private collection instead of silently producing a dead link.
 */
export type ShareCollectionDialogType = {
  id: string
  slug: string
  name: string
  description?: string | null
  visibility: CollectionRecord["visibility"]
}

export type MoveCollectionDialogType = {
  id: string
  name: string
  parentId: string | null
}

/**
 * Seed for the details dialog. Only an id and a name: the dialog fetches the
 * collection fresh (and re-fetches on every drill-down), so anything more here
 * would just be a second copy to keep in sync. The name is carried so the header
 * has something to show during the first load instead of a blank row.
 */
export type CollectionDetailsDialogType = {
  id: string
  name: string
}

export interface ModalData {
  profile?: Omit<UserType, "role" | "emailVerified" | "email">
  note?: UpdateNoteFormValues & { id: string }
  reportNoteId?: string
  collectionFormDialog?: CollectionFormDialogType
  deleteCollection?: Pick<CollectionRecord, "id" | "name">
  editCollection?: Pick<
    CollectionRecord,
    "id" | "name" | "description" | "visibility"
  >
  addNoteToCollectionsDialog?: AddNoteToCollectionsDialogType
  shareCollection?: ShareCollectionDialogType
  moveCollection?: MoveCollectionDialogType
  collectionDetails?: CollectionDetailsDialogType
}

export interface ModalStore {
  type: ModalType | null
  isOpen: boolean
  data: ModalData
  open: (type: ModalType, data?: ModalData) => void
  close: () => void
}

export const useModal = create<ModalStore>()(
  devtools((set) => ({
    type: null,
    isOpen: false,
    data: {},
    open: (type, data = {}) =>
      set({
        type,
        isOpen: true,
        data,
      }),
    close: () =>
      set({
        type: null,
        isOpen: false,
        data: {},
      }),
  }))
)
