"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar04Icon,
  CheckmarkBadge01Icon,
  Edit02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ProfileData } from "@/types/profile"
import { cn } from "@/lib/utils"
import { getInitials } from "@/utils/get-initials"
import { formatDate } from "@/utils/format-date"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { useModal } from "@/hooks/use-modal-store"

interface ProfileHeaderProps {
  profile: ProfileData
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { open } = useModal()

  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="size-18 border">
                <AvatarImage
                  src={profile.avatarUrl ?? undefined}
                  alt={`${profile.name}'s avatar`}
                />
                <AvatarFallback className="text-lg">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <HugeiconsIcon
                icon={CheckmarkBadge01Icon}
                size={24}
                color="currentColor"
                strokeWidth={2}
                className={cn(
                  "size-5 fill-blue-600 stroke-blue-600 text-white",
                  "absolute -right-0.5 bottom-0.5 flex items-center justify-center rounded-full bg-background"
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-medium text-foreground">
                  {profile.name}
                </h3>
                {profile.role && profile.role.toLowerCase() !== "user" ? (
                  <Badge variant="default" className="rounded-full capitalize">
                    {profile.role.toLowerCase()}
                  </Badge>
                ) : null}
              </div>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={Mail01Icon}
                  size={14}
                  color="currentColor"
                  strokeWidth={2}
                  className="size-3.5"
                />
                {profile.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={Calendar04Icon}
                  size={14}
                  color="currentColor"
                  strokeWidth={2}
                  className="size-3.5"
                />
                Member since{" "}
                {formatDate(profile.createdAt, {
                  dateStyle: "long",
                })}
              </span>
            </div>
            {profile.bio ? (
              <p className="max-w-xl text-sm text-foreground/80">
                {profile.bio}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-6 sm:flex-col sm:items-end">
          <div className="flex w-full gap-6 sm:justify-end">
            <div className="flex items-baseline-last gap-2">
              <p className="text-lg font-semibold text-foreground">
                {profile.totalContributions}
              </p>
              <p className="text-sm text-muted-foreground">Contributions</p>
            </div>
            <div className="flex items-baseline-last gap-2">
              <p className="text-lg font-semibold text-foreground">
                {profile.publishedContributions}
              </p>
              <p className="text-xs text-muted-foreground">Published</p>
            </div>
          </div>
          <div className="grid w-full gap-3 sm:flex sm:items-center sm:justify-end">
            <Button
              onClick={() =>
                open("update-profile", {
                  profile: {
                    id: profile.id,
                    name: profile.name,
                    username: profile.username,
                    avatar: profile.avatarUrl,
                    bio: profile.bio,
                  },
                })
              }
              variant="default"
              size="sm"
              className="w-full gap-2 sm:w-auto"
            >
              <HugeiconsIcon
                icon={Edit02Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
              Edit Profile
            </Button>
            {profile.publishedContributions > 0 && (
              <Link
                href={`/contributors/${profile.username}`}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "gap-2"
                )}
              >
                <HugeiconsIcon
                  icon={Edit02Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className={cn("size-4")}
                />
                View Contributor Profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
