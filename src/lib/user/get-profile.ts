import "server-only";
import { count, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { notes, users } from "@/db";
import { getCurrentUser } from "@/lib/auth/get-current-user";

import type { ProfileData } from "@/types/profile";

/**
 * Returns the authenticated user's profile, including aggregate
 * contribution counts. Never accepts a userId from the caller — the
 * user is always derived from the current session.
 *
 * Returns null if there is no authenticated user.
 */
export async function getCurrentUserProfile(): Promise<ProfileData | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const [profileRow] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      bio: users.bio,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1);

  if (!profileRow) {
    return null;
  }

  const [aggregate] = await db
    .select({
      total: count(),
      published: count(sql`CASE WHEN ${notes.status} = 'PUBLISHED' THEN 1 END`),
    })
    .from(notes)
    .where(eq(notes.contributorId, currentUser.id));

  const totalContributions = aggregate?.total ?? 0;
  const publishedContributions = aggregate?.published ?? 0;

  return {
    id: profileRow.id,
    name: profileRow.name,
    username: profileRow.username,
    bio: profileRow.bio,
    email: profileRow.email,
    avatarUrl: profileRow.avatarUrl,
    role: profileRow.role,
    createdAt: profileRow.createdAt,
    totalContributions,
    publishedContributions,
  };
}
