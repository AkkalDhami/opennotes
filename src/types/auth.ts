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
  bio?: string
  avatar: string | null
  role: "ADMIN" | "MODERATOR" | "USER"
}