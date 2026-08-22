import { NextRequest } from "next/server"

export type RateLimitConfig = {
  windowMs: number
  maxRequests: number
}

type RateLimitEntry = {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export const RATE_LIMITS = {
  report: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 reports per hour
  },

  feedback: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
  },

  contact: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
  },

  upload: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  },

  search: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },

  download: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  },
} satisfies Record<string, RateLimitConfig>

export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  )
}

export function getClientIPFromHeaders(headersList: Headers): string {
  return (
    headersList.get("cf-connecting-ip") ??
    headersList.get("x-real-ip") ??
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  )
}

export function checkRateLimit(key: string, config: RateLimitConfig) {
  const now = Date.now()
  const existing = rateLimitStore.get(key)

  if (!existing || now >= existing.resetTime) {
    const resetTime = now + config.windowMs

    rateLimitStore.set(key, {
      count: 1,
      resetTime,
    })

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    }
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
    }
  }

  existing.count++

  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetTime: existing.resetTime,
  }
}

// const ip = getClientIP(request)

// const rateLimit = checkRateLimit(`search:ip:${ip}`, RATE_LIMITS.search)

// const ip = getClientIP(request)

// const rateLimit = checkRateLimit(`search:ip:${ip}`, RATE_LIMITS.search)
