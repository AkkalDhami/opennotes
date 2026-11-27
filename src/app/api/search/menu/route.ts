import { NextRequest, NextResponse } from "next/server"

import { getPublicCollections } from "@/lib/collections/collections-queries"
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
} from "@/lib/custom-rate-limiter"
import { getContributorsRanking } from "@/lib/contributors/contributors-ranking"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { getTrendingNotes } from "@/lib/notes/get-trending-notes"
import { getTopSubjects } from "@/lib/notes/queries"
import type { CommandMenuData } from "@/types/command-menu"

/** Public, read-only shortcuts loaded the first time the command menu opens. */
export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request)
  const limit = checkRateLimit(
    `command-menu:ip:${clientIP}`,
    RATE_LIMITS.search
  )

  if (!limit.allowed) {
    const retryAfter = Math.ceil((limit.resetTime - Date.now()) / 1000)

    return NextResponse.json(
      {
        success: false,
        message: "Too many command menu requests. Try again shortly.",
        error: { status: 429, retryAfter },
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": RATE_LIMITS.search.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(limit.resetTime / 1000).toString(),
          "Retry-After": retryAfter.toString(),
          "Cache-Control": "no-store",
        },
      }
    )
  }

  const [
    notesResult,
    subjectsResult,
    contributorsResult,
    collectionsResult,
    authResult,
  ] = await Promise.allSettled([
    getTrendingNotes(5),
    getTopSubjects(6),
    getContributorsRanking(4),
    getPublicCollections({ page: 1, sort: "recent" }),
    getCurrentUser(),
  ])

  for (const result of [
    notesResult,
    subjectsResult,
    contributorsResult,
    collectionsResult,
    authResult,
  ]) {
    if (result.status === "rejected") {
      console.error("[GET /api/search/menu] section failed:", result.reason)
    }
  }

  const data: CommandMenuData = {
    notes:
      notesResult.status === "fulfilled"
        ? notesResult.value.map((note) => ({
            id: note.id,
            slug: note.slug,
            title: note.title,
            subject: note.subject,
            educationLevel: note.educationLevel ?? null,
            course: note.course ?? null,
            grade: note.grade,
            topic: note.topic,
            contributorName: note.contributor.name,
            contributorUsername: note.contributor.username,
          }))
        : [],
    subjects: subjectsResult.status === "fulfilled" ? subjectsResult.value : [],
    contributors:
      contributorsResult.status === "fulfilled"
        ? contributorsResult.value.map((contributor) => ({
            username: contributor.username,
            name: contributor.name,
            avatarUrl: contributor.avatarUrl,
            publishedNotes: contributor.publishedNotes,
          }))
        : [],
    collections:
      collectionsResult.status === "fulfilled"
        ? collectionsResult.value.items.slice(0, 4).map((collection) => ({
            slug: collection.slug,
            name: collection.name,
            description: collection.description,
            noteCount: collection.noteCount,
            creatorName: collection.creator?.name ?? null,
          }))
        : [],
  }

  const isAuthenticated =
    authResult.status === "fulfilled" && Boolean(authResult.value)

  return NextResponse.json(
    { success: true, data, isAuthenticated },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Limit": RATE_LIMITS.search.maxRequests.toString(),
        "X-RateLimit-Remaining": limit.remaining.toString(),
        "X-RateLimit-Reset": Math.ceil(limit.resetTime / 1000).toString(),
      },
    }
  )
}
