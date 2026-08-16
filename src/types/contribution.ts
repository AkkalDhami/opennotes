import { NoteStatus } from "@/db";
import { SortOption } from "./profile";

export interface ContributionListItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  subject: string;
  category: string;
  educationLevel: string;
  course: string | null;
  grade: string | null;
  topic: string | null;
  academicYear: string | null;
  status: NoteStatus;
  tags?: string[] | null;
  downloadCount: number;
  createdAt: Date;
  publishedAt: Date | null;
  rejectionReason: string | null;
}

export interface ContributionStats {
  total: number;
  published: number;
  pendingReview: number;
  rejected: number;
  draft: number;
  removed: number;
  totalDownloads: number;
}

export interface ContributionFilters {
  search?: string;
  status?: NoteStatus | "ALL";
  subject?: string;
  level?: string;
  course?: string;
  sort?: SortOption;
  page?: number;
}

export interface ContributionListResult {
  items: ContributionListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const STATUS_CONFIG: Record<
  NoteStatus,
  {
    label: string;
    description: string;
    badgeClassName: string;
  }
> = {
  DRAFT: {
    label: "Draft",
    description: "The note is saved but has not been submitted for review.",
    badgeClassName: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  PENDING_REVIEW: {
    label: "Pending Review",
    description: "Your note has been submitted and is waiting for admin review.",
    badgeClassName: "bg-warning/10 text-warning border-warning/20",
  },
  PUBLISHED: {
    label: "Published",
    description: "Your note is published and visible to the OpenNotes community.",
    badgeClassName: "bg-success/10 text-success border-success/20",
  },
  REJECTED: {
    label: "Rejected",
    description: "Your note was rejected by an administrator.",
    badgeClassName: "bg-destructive/10 text-destructive border-destructive/20",
  },
  REMOVED: {
    label: "Removed",
    description: "This note has been removed from publication.",
    badgeClassName: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
};
