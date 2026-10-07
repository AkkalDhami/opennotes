import "server-only"

import { getCurrentUser } from "@/lib/auth/get-current-user"
import { getLibraryStats } from "@/lib/user/collection-queries"
import {
  getUserContributions,
  getUserContributionStats,
} from "@/lib/user/get-contributions"
import { getCurrentUserProfile } from "@/lib/user/get-profile"
import { getSavedNotes } from "@/lib/user/saved-notes"
import { ContributionListItem, ContributionStats } from "@/types/contribution"
import { ProfileData } from "@/types/profile"
import { PublicNote } from "@/types/note"

const RECENT_NOTES_LIMIT = 5
const RECENT_SAVED_LIMIT = 4

export interface UserDashboardStats extends ContributionStats {
  savedNotes: number
  collections: number
}

export interface UserDashboardData {
  profile: ProfileData
  stats: UserDashboardStats
  recentNotes: ContributionListItem[]
  savedNotes: PublicNote[]
}

export async function getUserDashboard(): Promise<UserDashboardData | null> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return null
  }

  const [profile, contributionStats, contributions, saved, libraryStats] =
    await Promise.all([
      getCurrentUserProfile(),
      getUserContributionStats(),
      getUserContributions({ sort: "newest", page: 1 }),
      getSavedNotes({ userId: currentUser.id, page: 1 }),
      getLibraryStats(currentUser.id),
    ])

  if (!profile) {
    return null
  }

  return {
    profile,
    stats: {
      ...contributionStats,
      savedNotes: saved.total,
      collections: libraryStats.collectionCount,
    },
    recentNotes: contributions.items.slice(0, RECENT_NOTES_LIMIT),
    savedNotes: saved.notes.slice(0, RECENT_SAVED_LIMIT),
  }
}
