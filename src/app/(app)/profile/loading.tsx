import {
  ProfileHeaderSkeleton,
  ProfileStatsSkeleton,
  ProfileContributionsSkeleton,
} from "@/components/profile/profile-skeletons";

export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6">
      <ProfileHeaderSkeleton />
      <ProfileStatsSkeleton />
      <ProfileContributionsSkeleton />
    </div>
  );
}
