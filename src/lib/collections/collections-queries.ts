import "server-only"
import { and, asc, desc, eq, ilike, or, SQL, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { contributorProfiles, db, notes, users } from "@/db"
import { collections, collectionNotes, collectionSaves } from "@/db"

const PUBLIC = eq(collections.visibility, "PUBLIC") // enforced in EVERY public query, never from params
const publishedNote = eq(notes.status, "PUBLISHED")

export type SortKey =
  "recent" | "saved" | "viewed" | "downloaded" | "notes" | "updated" | "az"
const PAGE_SIZE = 18

// Aggregates count PUBLISHED notes only (raw table names match your schema).
const pubNotes = sql`from collection_notes cn join notes n on n.id = cn.note_id
  where cn.collection_id = ${collections.id} and n.status = 'PUBLISHED'`
const noteCount = sql<number>`(select count(*) ${pubNotes})`
const views = sql<number>`(select coalesce(sum(n.view_count),0) ${pubNotes})`
const downloads = sql<number>`(select coalesce(sum(n.download_count),0) ${pubNotes})`
const saves = sql<number>`(select count(*) from collection_saves cs where cs.collection_id = ${collections.id})`

const cardColumns = {
  id: collections.id,
  name: collections.name,
  slug: collections.slug,
  description: collections.description,
  createdAt: collections.createdAt,
  noteCount: noteCount.mapWith(Number),
  views: views.mapWith(Number),
  downloads: downloads.mapWith(Number),
  saves: saves.mapWith(Number),
  creator: {
    username: users.username,
    name: users.name,
    avatarUrl: users.avatarUrl,
    isVerified: sql<boolean>`coalesce(${contributorProfiles.isVerified}, false)`,
  },
}

const ORDER: Record<SortKey, SQL<unknown>> = {
  recent: desc(collections.createdAt),
  updated: desc(collections.updatedAt),
  saved: desc(saves),
  viewed: desc(views),
  downloaded: desc(downloads),
  notes: desc(noteCount),
  az: asc(collections.name),
}

export type CollectionFilters = {
  q?: string
  level?: string
  course?: string
  subject?: string
  creator?: string
  size?: string
  sort?: SortKey
  page?: number
}
const SIZE_RANGES: Record<string, [number, number]> = {
  "1-5": [1, 5],
  "6-20": [6, 20],
  "21-50": [21, 50],
  "50+": [51, 1_000_000],
}

const hasPublicNote = (cond: ReturnType<typeof sql>) =>
  sql`exists (select 1 ${pubNotes} and ${cond})`

function buildWhere(f: CollectionFilters) {
  const term = f.q?.trim() ? `%${f.q.trim()}%` : null
  const size = f.size ? SIZE_RANGES[f.size] : undefined
  return and(
    PUBLIC,
    term
      ? or(
          ilike(collections.name, term),
          ilike(collections.description, term),
          ilike(users.name, term),
          ilike(users.username, term),
          hasPublicNote(sql`(n.title ilike ${term} or n.subject ilike ${term} or n.course ilike ${term}
        or n.education_level ilike ${term} or array_to_string(n.tags, ' ') ilike ${term})`)
        )
      : undefined,
    f.level ? hasPublicNote(sql`n.education_level = ${f.level}`) : undefined,
    f.course ? hasPublicNote(sql`n.course = ${f.course}`) : undefined,
    f.subject ? hasPublicNote(sql`n.subject = ${f.subject}`) : undefined,
    size ? sql`${noteCount} between ${size[0]} and ${size[1]}` : undefined
  )
}

export async function getPublicCollections(f: CollectionFilters) {
  const page = Math.max(1, f.page ?? 1)
  const where = buildWhere(f)
  const [items, [{ total }]] = await Promise.all([
    db
      .select(cardColumns)
      .from(collections)
      .innerJoin(users, eq(users.id, collections.ownerId))
      .leftJoin(contributorProfiles, eq(contributorProfiles.userId, users.id))
      .where(where)
      .orderBy(ORDER[f.sort ?? "recent"], asc(collections.id))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(collections)
      .innerJoin(users, eq(users.id, collections.ownerId))
      .where(where),
  ])
  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

// Options come only from PUBLISHED notes inside PUBLIC collections.
export async function getCollectionFilterOptions() {
  const distinct = async (
    col:
      typeof notes.subject | typeof notes.course | typeof notes.educationLevel
  ) =>
    (
      await db
        .selectDistinct({ v: col })
        .from(collections)
        .innerJoin(
          collectionNotes,
          eq(collectionNotes.collectionId, collections.id)
        )
        .innerJoin(notes, eq(notes.id, collectionNotes.noteId))
        .where(and(PUBLIC, publishedNote))
        .orderBy(asc(col))
    )
      .map((r) => r.v)
      .filter((v) => v && v !== "Unknown")
  const [subjects, courses, levels] = await Promise.all([
    distinct(notes.subject),
    distinct(notes.course),
    distinct(notes.educationLevel),
  ])
  const opt = (v: string) => ({ value: v, label: v })
  return { subjects: subjects.map(opt), courses: courses.map(opt), levels }
}

export async function getPublicCollectionBySlug(
  username: string,
  slug: string
) {
  const [row] = await db
    .select({
      ...cardColumns,
      parentId: collections.parentId,
      ownerId: collections.ownerId,
    })
    .from(collections)
    .innerJoin(users, eq(users.id, collections.ownerId))
    .leftJoin(contributorProfiles, eq(contributorProfiles.userId, users.id))
    .where(
      and(eq(users.username, username), eq(collections.slug, slug), PUBLIC)
    )
    .limit(1)
  return row ?? null // private & missing look identical -> notFound()
}

export async function getPublicSubcollections(parentId: string) {
  return db
    .select({
      id: collections.id,
      name: collections.name,
      slug: collections.slug,
      description: collections.description,
      noteCount: noteCount.mapWith(Number),
      ownerUsername: users.username,
    })
    .from(collections)
    .innerJoin(users, eq(users.id, collections.ownerId))
    .where(and(eq(collections.parentId, parentId), PUBLIC))
    .orderBy(asc(collections.position))
}

// Walk up; stop at the first non-public ancestor so private names never leak.
export async function getPublicBreadcrumbs(parentId: string | null) {
  const trail: { name: string; slug: string; username: string }[] = []
  let cur = parentId
  while (cur) {
    const [p] = await db
      .select({
        name: collections.name,
        slug: collections.slug,
        parentId: collections.parentId,
        username: users.username,
      })
      .from(collections)
      .innerJoin(users, eq(users.id, collections.ownerId))
      .where(and(eq(collections.id, cur), PUBLIC))
      .limit(1)
    if (!p) break
    trail.unshift({ name: p.name, slug: p.slug, username: p.username })
    cur = p.parentId
  }
  return trail
}

export async function getPublicCollectionNotes(collectionId: string) {
  const contributor = alias(users, "contributor")
  return db
    .select({
      id: notes.id,
      slug: notes.slug,
      title: notes.title,
      subject: notes.subject,
      course: notes.course,
      viewCount: notes.viewCount,
      downloadCount: notes.downloadCount,
      contributor: { name: contributor.name, username: contributor.username },
    })
    .from(collectionNotes)
    .innerJoin(notes, eq(notes.id, collectionNotes.noteId))
    .innerJoin(contributor, eq(contributor.id, notes.contributorId)) // each note keeps its own contributor
    .where(and(eq(collectionNotes.collectionId, collectionId), publishedNote))
    .orderBy(desc(notes.publishedAt))
}

// Related = other PUBLIC collections (any creator) sharing a subject or course with this one's published notes.
export async function getRelatedPublicCollections(c: { id: string }) {
  const shared = sql`exists (
    select 1 from collection_notes mine join notes a on a.id = mine.note_id and a.status = 'PUBLISHED'
    join collection_notes theirs on theirs.collection_id = ${collections.id}
    join notes b on b.id = theirs.note_id and b.status = 'PUBLISHED'
    where mine.collection_id = ${c.id} and (a.subject = b.subject or (a.course = b.course and a.course <> 'Unknown')))`
  return db
    .select(cardColumns)
    .from(collections)
    .innerJoin(users, eq(users.id, collections.ownerId))
    .leftJoin(contributorProfiles, eq(contributorProfiles.userId, users.id))
    .where(and(PUBLIC, sql`${collections.id} <> ${c.id}`, shared))
    .orderBy(desc(saves))
    .limit(3)
}

export async function isCollectionSaved(
  userId: string | undefined,
  collectionId: string
) {
  if (!userId) return false
  const [r] = await db
    .select({ x: sql`1` })
    .from(collectionSaves)
    .where(
      and(
        eq(collectionSaves.userId, userId),
        eq(collectionSaves.collectionId, collectionId)
      )
    )
    .limit(1)
  return !!r
}
