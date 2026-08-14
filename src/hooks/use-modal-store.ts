import { UpdateProfileType } from "@/validations/auth"
import { create } from "zustand"
import { devtools } from "zustand/middleware"

export type ModalType = "update-profile" | "update-note"

export interface ModalData {
  profile?: UpdateProfileType & { id: string }
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
