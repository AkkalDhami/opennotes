export type ContributorRole = "student" | "teacher" | "contributor";

export interface Contributor {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
  role?: ContributorRole;
  subject?: string | null;
  notesCount: number;
  verified?: boolean;
}
