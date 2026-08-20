import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/utils/get-initials"

interface UserAvatarProps {
  name: string | null
  avatarUrl: string | null
  className?: string
}

export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
      <AvatarFallback aria-hidden={!!avatarUrl}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
