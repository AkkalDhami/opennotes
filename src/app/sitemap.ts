import { MetadataRoute } from "next"
import { db, notes, users } from "@/db"
import { eq, sql } from "drizzle-orm"

import { SITE_URL } from "@/constants/app.constants"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publicNotes, contributors] = await Promise.all([
    // Published public notes
    db
      .select({
        slug: notes.slug,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(eq(notes.status, "PUBLISHED")),

    // Users who have at least one published note
    db
      .select({
        username: users.username,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(
        notes,
        sql`${notes.contributorId} = ${users.id}
          AND ${notes.status} = 'PUBLISHED'`
      )
      .groupBy(users.id, users.username, users.updatedAt),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/notes`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contributors`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  const notePages: MetadataRoute.Sitemap = publicNotes.map((note) => ({
    url: `${SITE_URL}/notes/${note.slug}`,
    lastModified: note.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const contributorPages: MetadataRoute.Sitemap = contributors.map(
    (contributor) => ({
      url: `${SITE_URL}/contributors/${contributor.username}`,
      lastModified: contributor.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    })
  )

  return [...staticPages, ...notePages, ...contributorPages]
}
