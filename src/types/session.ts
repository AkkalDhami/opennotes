export type PublicSession = {
  sessionId: string
  userAgent: string
  ip: string
  createdAt: Date
  expiresAt: Date
  isCurrent: boolean
  parsedOs: string
  parsedBrowser: string
}

export type ParsedUserAgent = {
  os: string
  osVersion: string
  browser: string
  browserVersion: string
}

export type CurrentSession = {
  userId: string
  sessionId: string
}

export type PublicSessionType = {
  userId: string
  sessionId: string
  device: string
  deviceDetail: string
  deviceType: "desktop" | "mobile" | "tablet" | "unknown"
  location: string | null
  createdAt: Date
  expiresAt: Date
  isCurrent: boolean
}

export type SessionsOverview = {
  sessions: PublicSession[]
  activeCount: number
  maxSessions: number
}

export type LogoutIntent =
  | {
      kind: "session"
      sessionId: string
      deviceLabel: string
    }
  | { kind: "current" }
  | { kind: "others" }
  | { kind: "all" }

export type SessionActionResult =
  | { success: true }
  | {
      success: false
      message: string
    }
