import { eq } from "drizzle-orm"
import { db } from "@/db"
import { badges, userBadges } from "@/db/"

/** Slugs of badges the user currently holds — used to render earned vs. locked. */
export async function getEarnedBadgeSlugs(userId: string): Promise<string[]> {
  const rows = await db
    .select({ slug: badges.slug })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))

  return rows.map((r) => r.slug)
}
