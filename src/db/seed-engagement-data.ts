import { daysAgo, seedCollections, seedNotes, seedUsers } from "./seed-data"

export interface SeedModerationEvent {
  key: string
  noteSlug: string
  action: "PUBLISH" | "REJECT" | "REMOVE" | "RESTORE" | "UNPUBLISH"
  adminUsername: string
  reason: string | null
  createdAt: Date
}

export const seedModerationEvents: SeedModerationEvent[] = seedNotes.flatMap(
  (note, index) => {
    const adminUsername = index % 2 === 0 ? "seed-admin" : "seed-moderator"
    const eventDate = note.publishedAt ?? note.updatedAt
    const events: SeedModerationEvent[] = []

    if (note.status === "PUBLISHED") {
      events.push({
        key: `${note.slug}:publish`,
        noteSlug: note.slug,
        action: "PUBLISH",
        adminUsername,
        reason: "Content meets the publication guidelines.",
        createdAt: eventDate,
      })
    }

    if (note.status === "REJECTED") {
      events.push({
        key: `${note.slug}:reject`,
        noteSlug: note.slug,
        action: "REJECT",
        adminUsername,
        reason: note.rejectionReason,
        createdAt: eventDate,
      })
    }

    if (note.status === "REMOVED") {
      events.push({
        key: `${note.slug}:remove`,
        noteSlug: note.slug,
        action: "REMOVE",
        adminUsername,
        reason: "Removed during a routine content quality review.",
        createdAt: eventDate,
      })
    }

    if (index === 1) {
      events.push({
        key: `${note.slug}:restore`,
        noteSlug: note.slug,
        action: "RESTORE",
        adminUsername: "seed-admin",
        reason: "Restored after the contributor clarified attribution.",
        createdAt: daysAgo(12),
      })
    }

    if (index === 4) {
      events.push({
        key: `${note.slug}:unpublish`,
        noteSlug: note.slug,
        action: "UNPUBLISH",
        adminUsername: "seed-moderator",
        reason: "Returned to draft while the author updates the material.",
        createdAt: daysAgo(8),
      })
    }

    return events
  }
)

export interface SeedReport {
  key: string
  noteIndex: number
  reporterUsername: string
  reviewerUsername: string | null
  reason:
    | "COPYRIGHT"
    | "SPAM"
    | "INCORRECT"
    | "OFFENSIVE"
    | "MALWARE"
    | "DUPLICATE"
    | "OTHER"
  explanation: string
  status: "OPEN" | "DISMISSED" | "RESOLVED"
  resolutionNote: string | null
  createdAt: Date
}

export const seedReports: SeedReport[] = [
  {
    key: "incorrect-cell-answer",
    noteIndex: 2,
    reporterUsername: "test-reader",
    reviewerUsername: null,
    reason: "INCORRECT",
    explanation:
      "One of the practice answers appears to confuse diffusion with osmosis.",
    status: "OPEN",
    resolutionNote: null,
    createdAt: daysAgo(2),
  },
  {
    key: "copyright-calculus",
    noteIndex: 11,
    reporterUsername: "test-reader-two",
    reviewerUsername: "seed-admin",
    reason: "COPYRIGHT",
    explanation:
      "This page may include figures copied from a textbook without attribution.",
    status: "RESOLVED",
    resolutionNote:
      "The contributor added attribution and replaced the figures.",
    createdAt: daysAgo(9),
  },
  {
    key: "duplicate-sql",
    noteIndex: 20,
    reporterUsername: "rohan-verma",
    reviewerUsername: "seed-moderator",
    reason: "DUPLICATE",
    explanation: "This appears to duplicate an existing SQL revision guide.",
    status: "DISMISSED",
    resolutionNote: "The examples and target course level are different.",
    createdAt: daysAgo(14),
  },
  {
    key: "spam-physics",
    noteIndex: 26,
    reporterUsername: "maya-gurung",
    reviewerUsername: null,
    reason: "SPAM",
    explanation:
      "The description contains promotional links unrelated to the note.",
    status: "OPEN",
    resolutionNote: null,
    createdAt: daysAgo(4),
  },
  {
    key: "offensive-history",
    noteIndex: 50,
    reporterUsername: "anisha-rai",
    reviewerUsername: "seed-admin",
    reason: "OFFENSIVE",
    explanation: "A phrase in the summary is culturally insensitive.",
    status: "RESOLVED",
    resolutionNote: "The wording was revised and the note was republished.",
    createdAt: daysAgo(18),
  },
  {
    key: "malware-networks",
    noteIndex: 38,
    reporterUsername: "dipak-kc",
    reviewerUsername: null,
    reason: "MALWARE",
    explanation:
      "The download triggered an unexpected executable file warning.",
    status: "OPEN",
    resolutionNote: null,
    createdAt: daysAgo(1),
  },
  {
    key: "other-accounting",
    noteIndex: 44,
    reporterUsername: "test-reader",
    reviewerUsername: "seed-moderator",
    reason: "OTHER",
    explanation:
      "The accounting statements use inconsistent currency formatting.",
    status: "DISMISSED",
    resolutionNote: "Formatting differences are intentional for the exercise.",
    createdAt: daysAgo(22),
  },
  {
    key: "incorrect-ml",
    noteIndex: 56,
    reporterUsername: "test-reader-two",
    reviewerUsername: null,
    reason: "INCORRECT",
    explanation:
      "The precision and recall formulas are swapped in one example.",
    status: "OPEN",
    resolutionNote: null,
    createdAt: daysAgo(3),
  },
  {
    key: "copyright-literature",
    noteIndex: 47,
    reporterUsername: "rohan-verma",
    reviewerUsername: "seed-admin",
    reason: "COPYRIGHT",
    explanation: "Several long poem excerpts may exceed fair use.",
    status: "RESOLVED",
    resolutionNote:
      "Long excerpts were replaced with short summaries and citations.",
    createdAt: daysAgo(28),
  },
  {
    key: "duplicate-research",
    noteIndex: 59,
    reporterUsername: "maya-gurung",
    reviewerUsername: null,
    reason: "DUPLICATE",
    explanation:
      "This research design checklist duplicates another community resource.",
    status: "OPEN",
    resolutionNote: null,
    createdAt: daysAgo(5),
  },
]

export interface SeedBookmark {
  userUsername: string
  noteSlug: string
  createdAt: Date
}

const bookmarkMap = new Map<string, SeedBookmark>()

seedNotes.forEach((note, index) => {
  const usernames = [
    seedUsers[(index + 2) % seedUsers.length].username,
    seedUsers[(index + 7) % seedUsers.length].username,
  ]

  for (const username of usernames) {
    const key = `${username}:${note.slug}`
    if (!bookmarkMap.has(key)) {
      bookmarkMap.set(key, {
        userUsername: username,
        noteSlug: note.slug,
        createdAt: daysAgo(1 + (index % 45)),
      })
    }
  }
})

export const seedBookmarks = [...bookmarkMap.values()]

export interface SeedCollectionSave {
  userUsername: string
  collectionKey: string
  createdAt: Date
}

export const seedCollectionSaves: SeedCollectionSave[] = seedCollections
  .filter((collection) => collection.visibility === "PUBLIC")
  .flatMap((collection, collectionIndex) =>
    seedUsers
      .filter((user) => user.username !== collection.ownerUsername)
      .filter((_, userIndex) => (userIndex + collectionIndex) % 3 === 0)
      .map((user, userIndex) => ({
        userUsername: user.username,
        collectionKey: collection.key,
        createdAt: daysAgo(1 + ((collectionIndex + userIndex) % 40)),
      }))
  )

export interface SeedScoreEvent {
  key: string
  userUsername: string
  noteSlug: string | null
  type:
    | "NOTE_PUBLISHED"
    | "NOTE_DOWNLOADED"
    | "NOTE_VIEWED"
    | "NOTE_REPORTED"
    | "NOTE_REMOVED"
    | "MANUAL_ADJUSTMENT"
  points: number
  metadata: Record<string, string | number | boolean>
  createdAt: Date
}

export const seedScoreEvents: SeedScoreEvent[] = seedNotes.flatMap(
  (note, index) => {
    const events: SeedScoreEvent[] = []
    const eventDate = note.publishedAt ?? note.updatedAt

    if (note.status === "PUBLISHED") {
      events.push({
        key: `${note.slug}:published`,
        userUsername: note.contributorUsername,
        noteSlug: note.slug,
        type: "NOTE_PUBLISHED",
        points: 3,
        metadata: { source: "seed", status: note.status },
        createdAt: eventDate,
      })
    }

    if (note.status === "PUBLISHED" && index % 3 === 0) {
      events.push(
        {
          key: `${note.slug}:viewed`,
          userUsername: note.contributorUsername,
          noteSlug: note.slug,
          type: "NOTE_VIEWED",
          points: 0.1,
          metadata: { source: "seed", aggregateViews: note.viewCount },
          createdAt: daysAgo(1 + (index % 20)),
        },
        {
          key: `${note.slug}:downloaded`,
          userUsername: note.contributorUsername,
          noteSlug: note.slug,
          type: "NOTE_DOWNLOADED",
          points: 1.5,
          metadata: { source: "seed", aggregateDownloads: note.downloadCount },
          createdAt: daysAgo(2 + (index % 20)),
        }
      )
    }

    if (note.status === "REJECTED") {
      events.push({
        key: `${note.slug}:reported`,
        userUsername: note.contributorUsername,
        noteSlug: note.slug,
        type: "NOTE_REPORTED",
        points: -2,
        metadata: { source: "seed", reason: "quality-review" },
        createdAt: eventDate,
      })
    }

    if (note.status === "REMOVED") {
      events.push({
        key: `${note.slug}:removed`,
        userUsername: note.contributorUsername,
        noteSlug: note.slug,
        type: "NOTE_REMOVED",
        points: -5,
        metadata: { source: "seed", reason: "quality-review" },
        createdAt: eventDate,
      })
    }

    return events
  }
)

seedScoreEvents.push({
  key: "maya-manual-adjustment",
  userUsername: "maya-gurung",
  noteSlug: null,
  type: "MANUAL_ADJUSTMENT",
  points: 10,
  metadata: { source: "seed", reason: "community-review-bonus" },
  createdAt: daysAgo(6),
})
