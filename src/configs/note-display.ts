import { NoteSourceType, NoteStatus, ProcessingStatus } from "@/db"
import {
  CheckmarkBadge01Icon,
  Clock01Icon,
  Cancel01Icon,
  Delete02Icon,
  File01Icon,
  Alert02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIconProps } from "@hugeicons/react"

type IconType = HugeiconsIconProps["icon"]

interface StatusDisplay {
  label: string
  icon: IconType
  badgeVariant: "success" | "warning" | "error" | "default" | "outline"
}

export const NOTE_STATUS_DISPLAY: Record<NoteStatus, StatusDisplay> = {
  DRAFT: {
    label: "Draft",
    icon: File01Icon,
    badgeVariant: "outline",
  },
  PENDING_REVIEW: {
    label: "Pending review",
    icon: Clock01Icon,
    badgeVariant: "warning",
  },
  PUBLISHED: {
    label: "Published",
    icon: CheckmarkBadge01Icon,
    badgeVariant: "success",
  },
  REJECTED: {
    label: "Rejected",
    icon: Cancel01Icon,
    badgeVariant: "error",
  },
  REMOVED: {
    label: "Removed",
    icon: Delete02Icon,
    badgeVariant: "error",
  },
}

interface ProcessingDisplay {
  label: string
  icon: IconType
  badgeVariant: "success" | "warning" | "destructive" | "default" | "outline"
  spin?: boolean
}

export const PROCESSING_STATUS_DISPLAY: Record<
  ProcessingStatus,
  ProcessingDisplay
> = {
  PROCESSING: {
    label: "Processing…",
    icon: Loading03Icon,
    badgeVariant: "default",
    spin: true,
  },
  READY: {
    label: "Ready",
    icon: CheckmarkBadge01Icon,
    badgeVariant: "success",
  },
  FAILED: { label: "Failed", icon: Alert02Icon, badgeVariant: "destructive" },
}

interface SourceDisplay {
  label: string
  /** Short phrase used next to the badge, e.g. "Source: OpenStax". */
  attributionLabel: string | null
}

export const SOURCE_TYPE_DISPLAY: Record<NoteSourceType, SourceDisplay> = {
  ORIGINAL: { label: "Original", attributionLabel: null },
  PERMISSION_GRANTED: {
    label: "Permission granted",
    attributionLabel: "Author",
  },
  OPEN_LICENSE: { label: "Open license", attributionLabel: "Source" },
  PUBLIC_DOMAIN: { label: "Public domain", attributionLabel: "Source" },
}

export const SORT_OPTION_LABELS: Record<string, string> = {
  newest: "Newest",
  oldest: "Oldest",
  most_downloaded: "Most downloaded",
  most_viewed: "Most viewed",
  recently_updated: "Recently updated",
  title_asc: "Title A–Z",
  title_desc: "Title Z–A",
}
