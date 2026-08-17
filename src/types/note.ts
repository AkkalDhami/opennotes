/**
 * Shared types for the public Notes Discovery + Note Detail experience.
 *
 * ASSUMPTION: these mirror a `notes` table shaped roughly like the Drizzle
 * schema in `src/db/schema/notes.ts` (see that file's header comment).
 * Adjust field names here if your real schema differs — every other file
 * in this feature imports from this file, so this is the one place to fix.
 */

import { NoteSourceType } from "@/db"

export type NoteStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export type NoteSortOption = "relevance" | "downloads" | "newest" | "oldest"

export const NOTE_SORT_OPTIONS: { value: NoteSortOption; label: string }[] = [
  { value: "relevance", label: "Most relevant" },
  { value: "downloads", label: "Most downloaded" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
]

export interface PublicNote {
  id: string
  slug: string
  title: string
  description: string | null
  subject: string
  course: string
  grade: string | null
  educationLevel: string
  topic: string | null
  academicYear: string | null
  tags: string[] | []
  pageCount: number | null
  fileSizeBytes: number | null
  filePath: string
  // viewCount: number;
  downloadCount: number
  publishedAt: Date
  contributor: PublicContributor
  sourceType: NoteSourceType
  sourceUrl: string | null
  originalAuthor: string | null
}

export interface PublicContributor {
  id: string
  name: string
  username: string
  avatarUrl: string | null
  publishedNoteCount?: number
}

export interface NoteFilterState {
  q?: string
  subject?: string
  grade?: string
  educationLevel?: string
  topic?: string
  institution?: string
  academicYear?: string
  contributor?: string
  tags?: string[]
  sort?: NoteSortOption
  page?: number
}

export interface SearchNotesParams extends NoteFilterState {
  pageSize?: number
}

export interface SearchNotesResult {
  notes: PublicNote[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const DEFAULT_PAGE_SIZE = 12
