import { NextRequest, NextResponse } from "next/server"

import { SEARCH_CONFIG, suggestNotes } from "@/lib/search"
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
} from "@/lib/custom-rate-limiter"

/**
 * GET /api/search/suggest?q=elec
 *
 * Autocomplete for the search boxes. Deliberately a route handler rather than
 * a server action: it's a cacheable read that fires on almost every keystroke,
 * and server actions are POSTs that can't be cached and are serialised per
 * client.
 *
 * Returns published-note labels only — no ids, no draft or removed notes, and
 * nothing that depends on who's asking. That's what makes the response safe
 * to cache at the edge for everyone.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? ""

  // Answer trivially short input without touching the database or spending
  // any of the caller's rate-limit budget — otherwise clearing the input with
  // backspace would burn a request per keystroke.
  if (query.length < SEARCH_CONFIG.minSuggestLength) {
    return NextResponse.json(
      { success: true, data: { suggestions: [] } },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    )
  }

  const clientIP = getClientIP(request)
  const config = RATE_LIMITS.suggest
  const limit = checkRateLimit(`suggest:ip:${clientIP}`, config)

  if (!limit.allowed) {
    const retryAfter = Math.ceil((limit.resetTime - Date.now()) / 1000)

    return NextResponse.json(
      {
        success: false,
        message: "Too many suggestion requests. Try again shortly.",
        error: { status: 429, retryAfter },
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(limit.resetTime / 1000).toString(),
          "Retry-After": retryAfter.toString(),
        },
      }
    )
  }

  try {
    const suggestions = await suggestNotes(query)

    return NextResponse.json(
      { success: true, data: { suggestions } },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": limit.remaining.toString(),
          // Short shared cache: popular prefixes ("phy", "math") are typed
          // constantly and the underlying data changes only when a note is
          // published, so a minute of staleness is invisible.
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300, max-age=0",
        },
      }
    )
  } catch (error) {
    console.error("[GET /api/search/suggest] failed:", error)

    // An empty list is the right failure mode here: the search box stays
    // usable and the user can still submit their query.
    return NextResponse.json(
      { success: false, message: "Suggestions are unavailable." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
