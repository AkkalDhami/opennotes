export type SessionType = {
  userId: string
  sessionId: string
  refreshTokenHash: string
  userAgent: string
  ip: string
  createdAt: Date
  expiresAt: Date
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
