"use server"

import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { collections, collectionSaves } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export async function toggleSaveCollection(collectionId: string) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, reason: "unauthenticated" as const }
  const [c] = await db
    .select({ id: collections.id })
    .from(collections)
    .where(
      and(
        eq(collections.id, collectionId),
        eq(collections.visibility, "PUBLIC")
      )
    )
    .limit(1)
  if (!c) return { ok: false as const, reason: "not_found" as const }
  const key = and(
    eq(collectionSaves.userId, user.id),
    eq(collectionSaves.collectionId, collectionId)
  )
  const [existing] = await db.select().from(collectionSaves).where(key).limit(1)
  if (existing) {
    await db.delete(collectionSaves).where(key)
    return { ok: true as const, saved: false }
  }
  await db
    .insert(collectionSaves)
    .values({ userId: user.id, collectionId })
    .onConflictDoNothing()
  return { ok: true as const, saved: true }
}
