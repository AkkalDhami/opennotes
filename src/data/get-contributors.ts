import { mockContributors } from "@/data/contributors";
import type { Contributor } from "@/types/contributor";

/**
 * Returns the contributors shown on the homepage.
 *
 * TODO: replace with a Drizzle query once the schema is ready, e.g.
 *
 *   import { db } from "@/lib/db";
 *   import { contributors } from "@/lib/db/schema";
 *   import { desc } from "drizzle-orm";
 *
 *   export async function getFeaturedContributors(limit = 4): Promise<Contributor[]> {
 *     return db
 *       .select()
 *       .from(contributors)
 *       .orderBy(desc(contributors.notesCount))
 *       .limit(limit);
 *   }
 */

export async function getFeaturedContributors(
  limit = 4
): Promise<Contributor[]> {
  return mockContributors.slice(0, limit);
}
