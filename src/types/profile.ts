export const SORT_OPTIONS = ["newest", "oldest", "most_downloaded"] as const
export type SortOption = (typeof SORT_OPTIONS)[number]

export interface ProfileData {
  id: string
  name: string
  username: string
  bio: string | null
  email: string
  avatarUrl: string | null
  role: string | null
  createdAt: Date
  totalContributions: number
  publishedContributions: number
}
