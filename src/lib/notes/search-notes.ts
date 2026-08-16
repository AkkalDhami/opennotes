import { and, asc, desc, eq, ilike, or, sql, SQL } from "drizzle-orm"
import { db } from "@/db"
import { notes, users } from "@/db"
import {
  DEFAULT_PAGE_SIZE,
  PublicNote,
  SearchNotesParams,
  SearchNotesResult,
} from "@/types/note"
import { resolveDefaultSort } from "./note-filters"

/**
 * Search abstraction boundary.
 *
 * The Notes Discovery UI (page.tsx, note-grid.tsx, etc.) only ever calls
 * `searchNotes(params)` and never touches Drizzle/SQL directly. That keeps
 * the swap to a dedicated search engine (Meilisearch, Typesense, Algolia,
 * Elasticsearch/OpenSearch) a one-file change: implement `NotesSearchIndex`
 * against that engine and swap the export at the bottom of this file.
 */
export interface NotesSearchIndex {
  search(params: SearchNotesParams): Promise<SearchNotesResult>
}

class PostgresNotesSearchIndex implements NotesSearchIndex {
  async search(params: SearchNotesParams): Promise<SearchNotesResult> {
    const page = params.page && params.page > 0 ? params.page : 1
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE
    const offset = (page - 1) * pageSize

    const conditions: SQL[] = [eq(notes.status, "PUBLISHED")]

    if (params.q && params.q.trim()) {
      const term = `%${params.q.trim()}%`
      // Multi-field OR match across title, description, subject, topic,
      // tags, contributor name, and institution — per the brief's example
      // ("class 12 physics ray optics" should return relevant notes).
      const tagsMatch = sql`EXISTS (
        SELECT 1 FROM unnest(${notes.tags}) AS tag WHERE tag ILIKE ${term}
      )`
      conditions.push(
        or(
          ilike(notes.title, term),
          ilike(notes.description, term),
          ilike(notes.subject, term),
          ilike(notes.topic, term),
          ilike(users.name, term),
          tagsMatch
        )!
      )
    }

    if (params.subject) conditions.push(eq(notes.subject, params.subject))
    if (params.grade) conditions.push(eq(notes.grade, params.grade))
    if (params.educationLevel)
      conditions.push(eq(notes.educationLevel, params.educationLevel))
    if (params.topic) conditions.push(eq(notes.topic, params.topic))
    if (params.institution)
      if (params.academicYear)
        conditions.push(eq(notes.academicYear, params.academicYear))
    if (params.contributor)
      conditions.push(eq(users.username, params.contributor))
    if (params.tags && params.tags.length > 0) {
      for (const tag of params.tags) {
        conditions.push(sql`${tag} = ANY(${notes.tags})`)
      }
    }

    const whereClause = and(...conditions)

    const sort = resolveDefaultSort(params)
    const orderBy =
      sort === "downloads"
        ? [desc(notes.downloadCount)]
        : // : sort === "views"
          //   ? [desc(notes.viewCount)]
          sort === "oldest"
          ? [asc(notes.publishedAt)]
          : sort === "relevance" && params.q
            ? // Simple relevance proxy: title matches first, then recency.
              [
                desc(ilike(notes.title, `%${params.q}%`)),
                desc(notes.publishedAt),
              ]
            : [desc(notes.publishedAt)]

    const [rows, [{ count }]] = await Promise.all([
      db
        .select({
          id: notes.id,
          slug: notes.slug,
          title: notes.title,
          description: notes.description,
          subject: notes.subject,
          grade: notes.grade,
          educationLevel: notes.educationLevel,
          course: notes.course,
          topic: notes.topic,
          academicYear: notes.academicYear,
          tags: notes.tags,
          pageCount: notes.pageCount,
          fileSizeBytes: notes.fileSizeBytes,
          filePath: notes.filePath,
          // viewCount: notes.viewCount,
          downloadCount: notes.downloadCount,
          publishedAt: notes.publishedAt,
          contributorId: users.id,
          contributorName: users.name,
          contributorUsername: users.username,
          contributorAvatarUrl: users.avatarUrl,
        })
        .from(notes)
        .innerJoin(users, eq(notes.contributorId, users.id))
        .where(whereClause)
        .orderBy(...orderBy)
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(notes)
        .innerJoin(users, eq(notes.contributorId, users.id))
        .where(whereClause),
    ])

    const publicNotes: PublicNote[] = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      subject: row.subject,
      grade: row.grade,
      educationLevel: row.educationLevel as PublicNote["educationLevel"],
      course: row.course,
      topic: row.topic,
      academicYear: row.academicYear,
      tags: row.tags ?? [],
      fileType: "PDF",
      pageCount: row.pageCount,
      fileSizeBytes: row.fileSizeBytes,
      filePath: row.filePath,
      // viewCount: row.viewCount,
      downloadCount: row.downloadCount,
      publishedAt: row.publishedAt ? new Date(row.publishedAt) : new Date(),
      contributor: {
        id: row.contributorId,
        name: row.contributorName,
        username: row.contributorUsername,
        avatarUrl: row.contributorAvatarUrl,
      },
    }))

    return {
      notes: publicNotes,
      total: count,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
    }
  }
}

const notesSearchIndex: NotesSearchIndex = new PostgresNotesSearchIndex()

/** Public entry point used by the discovery page and its Server Components. */
export async function searchNotes(
  params: SearchNotesParams
): Promise<SearchNotesResult> {
  return notesSearchIndex.search(params)
}
