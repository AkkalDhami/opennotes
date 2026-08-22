/**
 * Shared types for the public Notes Discovery + Note Detail experience.
 *
 * ASSUMPTION: these mirror a `notes` table shaped roughly like the Drizzle
 * schema in `src/db/schema/notes.ts` (see that file's header comment).
 * Adjust field names here if your real schema differs — every other file
 * in this feature imports from this file, so this is the one place to fix.
 */

import {
  NoteModerationAction,
  NoteSourceType,
  NoteStatus,
  ProcessingStatus,
} from "@/db"

// export type NoteStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

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

/**
 * Domain types for the admin notes moderation surface.
 * These mirror the database enums 1:1 — keep in sync with db/schema.ts.
 */

// export const SOURCE_TYPE = [
//   "ORIGINAL",
//   "PERMISSION_GRANTED",
//   "OPEN_LICENSE",
//   "PUBLIC_DOMAIN",
// ] as const;
// export type SourceType = (typeof SOURCE_TYPE)[number];

// export const PROCESSING_STATUS = ["PROCESSING", "READY", "FAILED"] as const;
// export type ProcessingStatus = (typeof PROCESSING_STATUS)[number];

export const SORT_OPTIONS = [
  "newest",
  "oldest",
  "most_downloaded",
  "most_viewed",
  "recently_updated",
  "title_asc",
  "title_desc",
] as const
export type SortOption = (typeof SORT_OPTIONS)[number]

export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const
export type PageSize = number
// export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export interface AdminNoteContributor {
  id: string
  name: string
  username: string
  avatarUrl: string | null
  isVerified: boolean
}

export interface AdminNoteListItem {
  id: string
  slug: string
  title: string
  educationLevel: string
  grade: string
  course: string
  topic: string | null
  tags: string[]
  subject: string
  contributor: AdminNoteContributor
  sourceType: NoteSourceType
  sourceAuthor: string | null
  sourceUrl: string | null
  status: NoteStatus
  processingStatus: ProcessingStatus
  downloadCount: number
  // viewCount: number
  publishedAt: string | null
  updatedAt: string
  createdAt: string
}

export interface AdminNoteDetail extends AdminNoteListItem {
  description: string | null
  fileUrl: string
  fileSizeBytes: number
  pageCount: number | null
  fileHash: string | null
  // institution: string | null;
  moderationHistory: AdminModerationEvent[]
}

export interface AdminModerationEvent {
  id: string
  action: NoteModerationAction
  adminUsername: string
  reason: string | null
  createdAt: string
}

export interface AdminNoteStats {
  totalNotes: number
  totalNotesDeltaThisMonth: number
  published: number
  pendingReview: number
  removed: number
}

export interface AdminNotesFilters {
  q?: string
  status?: NoteStatus
  subject?: string
  educationLevel?: string
  sourceType?: NoteSourceType
  processingStatus?: ProcessingStatus
  sort: SortOption
  page: number
  pageSize: PageSize
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
