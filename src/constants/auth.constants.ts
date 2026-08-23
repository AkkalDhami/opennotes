export const MAX_SESSIONS = 6 as const

export const MAX_SESSIONS_DAYS = 30

export const aboutSessionsItems: string[] = [
  `You can be signed in on up to ${MAX_SESSIONS} devices at the same time.`,
  `Each session remains active for ${MAX_SESSIONS_DAYS} days.`,
  "When the limit is reached, you'll need to log out from an existing session to sign in on a new device.",
]

export const securityTips: string[] = [
  "Always log out from devices you don't use anymore.",
  "Don't share your account or login details with anyone.",
]
