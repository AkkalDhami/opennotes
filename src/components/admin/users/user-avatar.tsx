import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  name: string | null
  avatarUrl: string | null
  className?: string
}

function getInitials(name: string | null) {
  if (!name) return "?"
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  )
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
