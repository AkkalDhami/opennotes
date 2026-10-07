import { NoteStatus } from "@/db"
import { NOTE_STATUSES } from "@/validations/note"
import { SORT_OPTIONS, SortOption } from "@/types/profile"

export type NotesView = "table" | "card"

export function parseParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export function parseStatus(value: string | undefined): NoteStatus | "ALL" {
  if (!value || value === "ALL") return "ALL"
  return NOTE_STATUSES.includes(value as NoteStatus)
    ? (value as NoteStatus)
    : "ALL"
}

export function parseSort(value: string | undefined): SortOption {
  return SORT_OPTIONS.includes(value as SortOption)
    ? (value as SortOption)
    : "newest"
}

export function parseNotesView(value: string | undefined): NotesView {
  return value === "card" ? "card" : "table"
}
