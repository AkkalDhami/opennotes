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
