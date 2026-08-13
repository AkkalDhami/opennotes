export interface Note {
  id: string;
  title: string;
  slug: string;
  subject: string;
  level?: string;
  contributor: {
    name: string;
    avatarUrl?: string;
  };
  downloads: number;
  views?: number;
  trending?: boolean;
}

/**
 * Placeholder data — replace with a query once notes are backed by the
 * database, e.g. `db.query.notes.findMany({ orderBy: desc(downloads) })`.
 */
export const trendingNotes: Note[] = [
  {
    id: "1",
    title: "Electromagnetic Induction — Complete Notes",
    slug: "electromagnetic-induction-complete-notes",
    subject: "Physics",
    level: "Class 12",
    contributor: { name: "Rahul Sharma" },
    downloads: 234,
    views: 1200,
    trending: true,
  },
  {
    id: "2",
    title: "Limits, Continuity & Differentiability",
    slug: "limits-continuity-differentiability",
    subject: "Mathematics",
    level: "BSc",
    contributor: { name: "Priya Nair" },
    downloads: 189,
    views: 940,
    trending: true,
  },
  {
    id: "3",
    title: "Database Management Systems — Unit 1 to 5",
    slug: "dbms-unit-1-to-5",
    subject: "Computer Science",
    level: "BCA",
    contributor: { name: "Arjun Mehta" },
    downloads: 156,
    views: 810,
    trending: true,
  },
  {
    id: "4",
    title: "Organic Chemistry Reaction Mechanisms",
    slug: "organic-chemistry-reaction-mechanisms",
    subject: "Chemistry",
    level: "Class 12",
    contributor: { name: "Sneha Iyer" },
    downloads: 142,
    views: 705,
    trending: true,
  },
];
