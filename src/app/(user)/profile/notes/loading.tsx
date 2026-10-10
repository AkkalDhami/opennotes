import { Skeleton } from "@/components/ui/skeleton"
import { ProfileContributionsSkeleton } from "@/components/profile/profile-skeletons"

export default function NotesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <ProfileContributionsSkeleton />
    </div>
  )
}
