import type { Contributor } from "@/types/contributor";

/**
 * Temporary mock data for the homepage Contributors section.
 *
 * Replace with a Drizzle query against Neon Postgres once the
 * `contributors` (or `users` + notes aggregation) query is ready, e.g.:
 *
 *   const contributors = await db
 *     .select({ ... })
 *     .from(users)
 *     .innerJoin(notes, eq(notes.authorId, users.id))
 *     .groupBy(users.id)
 *     .orderBy(desc(sql`count(${notes.id})`))
 *     .limit(4);
 *
 * This file can be deleted once that query is wired into
 * `components/home/contributors-section.tsx`.
 */
export const mockContributors: Contributor[] = [
  {
    id: "1",
    username: "rahul-sharma",
    name: "Rahul Sharma",
    avatarUrl: null,
    role: "student",
    subject: "Physics",
    notesCount: 24,
  },
  {
    id: "2",
    username: "sita-thapa",
    name: "Sita Thapa",
    avatarUrl: null,
    role: "teacher",
    subject: "Mathematics",
    notesCount: 18,
    verified: true,
  },
  {
    id: "3",
    username: "anish-karki",
    name: "Anish Karki",
    avatarUrl: null,
    role: "student",
    subject: "Computer Science",
    notesCount: 15,
  },
  {
    id: "4",
    username: "prakriti-gurung",
    name: "Prakriti Gurung",
    avatarUrl: null,
    role: "contributor",
    subject: "Biology",
    notesCount: 11,
  },
];
