export type SessionType = {
  userId: string
  refreshTokenHash: string
}

export type UserType = {
  id: string
  name: string
  email: string
  username: string
  emailVerified: boolean
  bio?: string | null
  avatar: string | null
  role: "ADMIN" | "MODERATOR" | "USER"
}
