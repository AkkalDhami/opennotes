import { eq, inArray } from "drizzle-orm"
import { db } from "@/db"
import { badges, userBadges } from "@/db"
import { BADGE_DEFINITIONS } from "./badge-definitions"
import { ContributorMetrics } from "./scoring"

/**
 * Idempotently ensures every badge in BADGE_DEFINITIONS has a row in the
 * `badges` table. Safe to run on every deploy/startup — existing rows are
 * left untouched by slug.
 */
export async function seedBadges(): Promise<void> {
  await db
    .insert(badges)
    .values(
      BADGE_DEFINITIONS.map((b) => ({
        slug: b.slug,
        name: b.name,
        description: b.description,
        tier: b.tier,
      }))
    )
    .onConflictDoNothing({ target: badges.slug })
}

/** Which badge slugs the contributor currently qualifies for, given metrics. */
export function evaluateContributorBadges(
  metrics: ContributorMetrics
): string[] {
  return BADGE_DEFINITIONS.filter((b) => b.qualifies(metrics)).map(
    (b) => b.slug
  )
}

/**
 * Reconciles `user_badges` with current qualification:
 *  - inserts badges newly qualified for
 *  - deletes badges no longer qualified for (§16 — removal must cascade
 *    down from note removal, not just gate new awards)
 *
 * Re-running this with unchanged metrics is a no-op: nothing to add, nothing
 * to remove. That's the idempotency guarantee for badges specifically.
 */
export async function syncContributorBadges(
  userId: string,
  metrics: ContributorMetrics
): Promise<void> {
  const qualifyingSlugs = evaluateContributorBadges(metrics)

  const qualifyingBadgeRows = qualifyingSlugs.length
    ? await db
        .select()
        .from(badges)
        .where(inArray(badges.slug, qualifyingSlugs))
    : []
  const qualifyingBadgeIds = new Set(qualifyingBadgeRows.map((b) => b.id))

  const existing = await db
    .select()
    .from(userBadges)
    .where(eq(userBadges.userId, userId))
  const existingBadgeIds = new Set(existing.map((u) => u.badgeId))

  const toInsert = qualifyingBadgeRows.filter(
    (b) => !existingBadgeIds.has(b.id)
  )
  const toDelete = existing.filter((u) => !qualifyingBadgeIds.has(u.badgeId))

  if (toInsert.length > 0) {
    await db
      .insert(userBadges)
      .values(toInsert.map((b) => ({ userId, badgeId: b.id })))
      // Belt-and-suspenders: the unique(userId, badgeId) index already
      // prevents duplicates even under concurrent syncs (§9).
      .onConflictDoNothing({ target: [userBadges.userId, userBadges.badgeId] })
  }

  if (toDelete.length > 0) {
    await db.delete(userBadges).where(
      inArray(
        userBadges.id,
        toDelete.map((u) => u.id)
      )
    )
  }
}
