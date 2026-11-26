import { createHash } from "node:crypto"

import { sql } from "drizzle-orm"

import {
  accounts,
  badges,
  bookmarks,
  collectionNotes,
  collectionSaves,
  collections,
  contributorProfiles,
  contributorScoreEvents,
  contributorStats,
  db,
  noteModerationEvents,
  notes,
  reports,
  userBadges,
  users,
} from "./index"
import { daysAgo, seedCollections, seedNotes, seedUsers } from "./seed-data"
import {
  seedBookmarks,
  seedCollectionSaves,
  seedModerationEvents,
  seedReports,
  seedScoreEvents,
} from "./seed-engagement-data"
import { BADGE_DEFINITIONS } from "@/lib/contributors/badge-definitions"
import {
  calculateScore,
  calculateTier,
  type ContributorMetrics,
} from "@/lib/contributors/scoring"

function seedId(kind: string, key: string) {
  const hash = createHash("sha256")
    .update(`opennotes-seed:v1:${kind}:${key}`)
    .digest()

  hash[6] = (hash[6] & 0x0f) | 0x50
  hash[8] = (hash[8] & 0x3f) | 0x80

  const hex = hash.subarray(0, 16).toString("hex")

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function requireId(map: Map<string, string>, key: string) {
  const id = map.get(key)

  if (!id) {
    throw new Error(`Missing seeded ID for "${key}"`)
  }

  return id
}

async function seedDatabase() {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(734221)`)

    const userIds = new Map(
      seedUsers.map((user) => [user.username, seedId("user", user.username)])
    )
    const noteIds = new Map(
      seedNotes.map((note) => [note.slug, seedId("note", note.slug)])
    )
    const collectionIds = new Map(
      seedCollections.map((collection) => [
        collection.key,
        seedId("collection", collection.key),
      ])
    )
    const badgeIds = new Map(
      BADGE_DEFINITIONS.map((badge) => [
        badge.slug,
        seedId("badge", badge.slug),
      ])
    )

    const userRows = seedUsers.map((user) => ({
      id: requireId(userIds, user.username),
      email: user.email,
      emailVerified: true,
      name: user.name,
      role: user.role,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      avatarId: null,
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
    }))

    await tx
      .insert(users)
      .values(userRows)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          emailVerified: sql`excluded.email_verified`,
          name: sql`excluded.name`,
          role: sql`excluded.role`,
          username: sql`excluded.username`,
          bio: sql`excluded.bio`,
          avatarUrl: sql`excluded.avatar_url`,
          avatarId: sql`excluded.avatar_id`,
          updatedAt: sql`excluded.updated_at`,
        },
      })

    const accountRows = seedUsers.map((user) => ({
      id: seedId("account", user.username),
      userId: requireId(userIds, user.username),
      provider: user.provider,
      providerAccountId: `seed-${user.provider}-${user.username}`,
    }))

    await tx.insert(accounts).values(accountRows).onConflictDoNothing()

    const profileRows = seedUsers.flatMap((user) =>
      user.profile
        ? [
            {
              id: seedId("contributor-profile", user.username),
              userId: requireId(userIds, user.username),
              ...user.profile,
              createdAt: user.createdAt,
              updatedAt: user.createdAt,
            },
          ]
        : []
    )

    await tx
      .insert(contributorProfiles)
      .values(profileRows)
      .onConflictDoUpdate({
        target: contributorProfiles.userId,
        set: {
          type: sql`excluded.type`,
          bio: sql`excluded.bio`,
          institutionName: sql`excluded.institution_name`,
          institutionType: sql`excluded.institution_type`,
          socialLinks: sql`excluded.social_links`,
          department: sql`excluded.department`,
          program: sql`excluded.program`,
          designation: sql`excluded.designation`,
          isVerified: sql`excluded.is_verified`,
          updatedAt: sql`excluded.updated_at`,
        },
      })

    const noteRows = seedNotes.map((note) => ({
      id: requireId(noteIds, note.slug),
      slug: note.slug,
      title: note.title,
      description: note.description,
      contributorId: requireId(userIds, note.contributorUsername),
      subject: note.subject,
      category: note.category,
      sourceType: note.sourceType,
      originalAuthor: note.originalAuthor,
      sourceUrl: note.sourceUrl,
      educationLevel: note.educationLevel,
      course: note.course,
      grade: note.grade,
      topic: note.topic,
      academicYear: note.academicYear,
      fileKey: note.fileKey,
      fileHash: note.fileHash,
      fileSizeBytes: note.fileSizeBytes,
      pageCount: note.pageCount,
      processingStatus: note.processingStatus,
      status: note.status,
      downloadCount: note.downloadCount,
      viewCount: note.viewCount,
      rejectionReason: note.rejectionReason,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      publishedAt: note.publishedAt,
      tags: note.tags,
    }))

    await tx
      .insert(notes)
      .values(noteRows)
      .onConflictDoUpdate({
        target: notes.slug,
        set: {
          title: sql`excluded.title`,
          description: sql`excluded.description`,
          contributorId: sql`excluded.contributor_id`,
          subject: sql`excluded.subject`,
          category: sql`excluded.category`,
          sourceType: sql`excluded.source_type`,
          originalAuthor: sql`excluded.original_author`,
          sourceUrl: sql`excluded.source_url`,
          educationLevel: sql`excluded.education_level`,
          course: sql`excluded.course`,
          grade: sql`excluded.grade`,
          topic: sql`excluded.topic`,
          academicYear: sql`excluded.academic_year`,
          fileKey: sql`excluded.file_key`,
          fileHash: sql`excluded.file_hash`,
          fileSizeBytes: sql`excluded.file_size_bytes`,
          pageCount: sql`excluded.page_count`,
          processingStatus: sql`excluded.processing_status`,
          status: sql`excluded.status`,
          downloadCount: sql`excluded.download_count`,
          viewCount: sql`excluded.view_count`,
          rejectionReason: sql`excluded.rejection_reason`,
          createdAt: sql`excluded.created_at`,
          updatedAt: sql`excluded.updated_at`,
          publishedAt: sql`excluded.published_at`,
          tags: sql`excluded.tags`,
        },
      })

    const moderationRows = seedModerationEvents.map((event) => ({
      id: seedId("moderation-event", event.key),
      noteId: requireId(noteIds, event.noteSlug),
      action: event.action,
      adminId: requireId(userIds, event.adminUsername),
      reason: event.reason,
      createdAt: event.createdAt,
      updatedAt: event.createdAt,
    }))

    await tx
      .insert(noteModerationEvents)
      .values(moderationRows)
      .onConflictDoNothing()

    const reportRows = seedReports.map((report) => ({
      id: seedId("report", report.key),
      noteId: requireId(noteIds, seedNotes[report.noteIndex].slug),
      reporterId: requireId(userIds, report.reporterUsername),
      reason: report.reason,
      explanation: report.explanation,
      status: report.status,
      reviewedBy: report.reviewerUsername
        ? requireId(userIds, report.reviewerUsername)
        : null,
      resolutionNote: report.resolutionNote,
      reviewedAt: report.reviewerUsername ? report.createdAt : null,
      reporterIpHash: createHash("sha256")
        .update(`seed-report-ip:${report.key}`)
        .digest("hex"),
      createdAt: report.createdAt,
      updatedAt: report.createdAt,
    }))

    await tx.insert(reports).values(reportRows).onConflictDoNothing()

    const badgeRows = BADGE_DEFINITIONS.map((badge) => ({
      id: requireId(badgeIds, badge.slug),
      slug: badge.slug,
      name: badge.name,
      description: badge.description,
      tier: badge.tier,
    }))

    await tx
      .insert(badges)
      .values(badgeRows)
      .onConflictDoUpdate({
        target: badges.slug,
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          tier: sql`excluded.tier`,
          updatedAt: new Date(),
        },
      })

    const bookmarkRows = seedBookmarks.map((bookmark) => ({
      userId: requireId(userIds, bookmark.userUsername),
      noteId: requireId(noteIds, bookmark.noteSlug),
      createdAt: bookmark.createdAt,
      updatedAt: bookmark.createdAt,
    }))

    await tx.insert(bookmarks).values(bookmarkRows).onConflictDoNothing()

    const metricsByUsername = new Map<string, ContributorMetrics>()

    for (const user of seedUsers) {
      const userNotes = seedNotes.filter(
        (note) => note.contributorUsername === user.username
      )

      if (userNotes.length === 0) continue

      const publishedNotes = userNotes.filter(
        (note) => note.status === "PUBLISHED"
      )
      const publishedNoteSlugs = new Set(
        publishedNotes.map((note) => note.slug)
      )
      const downloads = publishedNotes.reduce(
        (total, note) => total + note.downloadCount,
        0
      )
      const views = publishedNotes.reduce(
        (total, note) => total + note.viewCount,
        0
      )
      const bookmarkCount = seedBookmarks.filter((bookmark) =>
        publishedNoteSlugs.has(bookmark.noteSlug)
      ).length
      const activeMonths = new Set(
        publishedNotes.map((note) =>
          note.publishedAt
            ? `${note.publishedAt.getUTCFullYear()}-${note.publishedAt.getUTCMonth()}`
            : ""
        )
      ).size
      const distinctSubjects = new Set(
        publishedNotes.map((note) => note.subject)
      ).size
      const score = calculateScore({
        publishedNotes: publishedNotes.length,
        downloads,
        views,
        bookmarks: bookmarkCount,
      })
      const tier = calculateTier(score)
      const lastContributionAt = userNotes.reduce(
        (latest, note) => (note.createdAt > latest ? note.createdAt : latest),
        userNotes[0].createdAt
      )

      const metrics: ContributorMetrics = {
        publishedNotes: publishedNotes.length,
        downloads,
        views,
        bookmarks: bookmarkCount,
        activeMonths,
        distinctSubjects,
        score,
        tier: tier.tier,
        tierLabel: tier.label,
      }

      metricsByUsername.set(user.username, metrics)

      await tx
        .insert(contributorStats)
        .values({
          id: seedId("contributor-stats", user.username),
          userId: requireId(userIds, user.username),
          noteCount: userNotes.length,
          downloadCount: downloads,
          viewCount: views,
          uniqueSubjectCount: distinctSubjects,
          totalScore: score,
          qualityScore: Math.round(score * 0.35 * 10) / 10,
          impactScore: Math.round(downloads * 0.15 * 10) / 10,
          consistencyScore: activeMonths * 12,
          lastContributionAt,
          calculatedAt: new Date(),
          createdAt: user.createdAt,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: contributorStats.userId,
          set: {
            noteCount: sql`excluded.note_count`,
            downloadCount: sql`excluded.download_count`,
            viewCount: sql`excluded.view_count`,
            uniqueSubjectCount: sql`excluded.unique_subject_count`,
            totalScore: sql`excluded.total_score`,
            qualityScore: sql`excluded.quality_score`,
            impactScore: sql`excluded.impact_score`,
            consistencyScore: sql`excluded.consistency_score`,
            lastContributionAt: sql`excluded.last_contribution_at`,
            calculatedAt: sql`excluded.calculated_at`,
            updatedAt: sql`excluded.updated_at`,
          },
        })
    }

    const scoreEventRows = seedScoreEvents.map((event) => ({
      id: seedId("score-event", event.key),
      userId: requireId(userIds, event.userUsername),
      noteId: event.noteSlug ? requireId(noteIds, event.noteSlug) : null,
      type: event.type,
      points: event.points,
      metadata: event.metadata,
      createdAt: event.createdAt,
      updatedAt: event.createdAt,
    }))

    await tx
      .insert(contributorScoreEvents)
      .values(scoreEventRows)
      .onConflictDoNothing()

    const userBadgeRows = [...metricsByUsername.entries()].flatMap(
      ([username, metrics]) =>
        BADGE_DEFINITIONS.filter((badge) => badge.qualifies(metrics)).map(
          (badge) => ({
            id: seedId("user-badge", `${username}:${badge.slug}`),
            userId: requireId(userIds, username),
            badgeId: requireId(badgeIds, badge.slug),
            awardedAt: daysAgo(20 + metrics.publishedNotes),
          })
        )
    )

    await tx.insert(userBadges).values(userBadgeRows).onConflictDoNothing()

    const collectionRows = seedCollections.map((collection, index) => ({
      id: requireId(collectionIds, collection.key),
      ownerId: requireId(userIds, collection.ownerUsername),
      parentId: collection.parentKey
        ? requireId(collectionIds, collection.parentKey)
        : null,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      visibility: collection.visibility,
      position: collection.position,
      createdAt: daysAgo(150 - index * 5),
      updatedAt: daysAgo(30 - (index % 25)),
    }))

    await tx
      .insert(collections)
      .values(collectionRows)
      .onConflictDoUpdate({
        target: [collections.ownerId, collections.slug],
        set: {
          parentId: sql`excluded.parent_id`,
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          visibility: sql`excluded.visibility`,
          position: sql`excluded.position`,
          updatedAt: sql`excluded.updated_at`,
        },
      })

    const collectionNoteRows = seedCollections.flatMap((collection) =>
      collection.noteIndexes.map((noteIndex) => ({
        collectionId: requireId(collectionIds, collection.key),
        noteId: requireId(noteIds, seedNotes[noteIndex].slug),
      }))
    )

    await tx
      .insert(collectionNotes)
      .values(collectionNoteRows)
      .onConflictDoNothing()

    const collectionSaveRows = seedCollectionSaves.map((save) => ({
      userId: requireId(userIds, save.userUsername),
      collectionId: requireId(collectionIds, save.collectionKey),
      createdAt: save.createdAt,
      updatedAt: save.createdAt,
    }))

    await tx
      .insert(collectionSaves)
      .values(collectionSaveRows)
      .onConflictDoNothing()

    const result = await tx.execute(
      sql.raw(`
      select
        (select count(*) from users) as users,
        (select count(*) from accounts) as accounts,
        (select count(*) from contributor_profiles) as contributor_profiles,
        (select count(*) from notes) as notes,
        (select count(*) from note_moderation_events) as note_moderation_events,
        (select count(*) from reports) as reports,
        (select count(*) from badges) as badges,
        (select count(*) from user_badges) as user_badges,
        (select count(*) from bookmarks) as bookmarks,
        (select count(*) from contributor_stats) as contributor_stats,
        (select count(*) from contributor_score_events) as contributor_score_events,
        (select count(*) from collections) as collections,
        (select count(*) from collection_notes) as collection_notes,
        (select count(*) from collection_saves) as collection_saves
    `)
    )

    const row = result.rows[0] as Record<string, string>

    return Object.fromEntries(
      Object.entries(row).map(([table, count]) => [table, Number(count)])
    )
  })
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Run npm run db:seed instead.")
  }

  const counts = await seedDatabase()

  console.log("Database seed completed successfully.")
  console.table(counts)
  console.log(
    "Seeded users are data-only OAuth accounts; normal sign-in still requires a real provider account."
  )
}

main().catch((error) => {
  console.error("Database seed failed:", error)
  process.exitCode = 1
})
