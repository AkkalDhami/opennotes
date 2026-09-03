"use client"

import { Edit02Icon } from "@hugeicons/core-free-icons"
import { SettingsSection } from "./settings-section"
import { APP_NAME } from "@/constants/app.constants"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal-store"
import { UserType } from "@/types/auth"
import { VerifiedUserAvatar } from "@/components/shared/verified-user-avatar"
import { Badge } from "@/components/ui/badge"

export function ProfileSettings({ user }: { user: UserType }) {
  const { open } = useModal()

  return (
    <div className="space-y-4">
      <SettingsSection
        title="Profile"
        description={`Manage how you appear to other learners on ${APP_NAME}`}
        cta={
          <Button
            onClick={() =>
              open("update-profile", {
                profile: {
                  id: user.id,
                  name: user.name,
                  username: user.username,
                  avatar: user.avatar,
                  bio: user.bio,
                },
              })
            }
            variant="outline"
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
        }
      >
        <div className="mt-6 flex items-center gap-3 sm:mt-4">
          <div className="relativ">
            <VerifiedUserAvatar
              displayName={user.name}
              emailVerified={user.emailVerified}
              avatarUrl={user.avatar}
              size="lg"
            />
          </div>
          <div className="min-w-0 space-y-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-lg font-medium text-foreground">
                {user.name}
              </p>
              {user.role === "ADMIN" && <Badge variant="default">Admin</Badge>}
            </div>
            <div className="text-xm text-muted-foreground">
              @{user.username}
            </div>
            {user.bio && (
              <div className="text-muted-foreground">{user.bio}</div>
            )}
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}
