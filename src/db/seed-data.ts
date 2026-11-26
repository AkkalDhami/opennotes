import { createHash } from "node:crypto"

import type {
  NoteSourceType,
  NoteStatus,
  ProcessingStatus,
} from "./schemas/note.schema"

type UserRole = "USER" | "MODERATOR" | "ADMIN"
type ContributorType =
  "STUDENT" | "TEACHER" | "PROFESSIONAL" | "ORGANIZATION" | "INDEPENDENT"
type InstitutionType = "SCHOOL" | "COLLEGE" | "UNIVERSITY" | "OTHER"
type SocialPlatform =
  | "WEBSITE"
  | "GITHUB"
  | "LINKEDIN"
  | "X"
  | "FACEBOOK"
  | "INSTAGRAM"
  | "YOUTUBE"
  | "TELEGRAM"
  | "DISCORD"

interface SeedSocialLink {
  platform: SocialPlatform
  url: string
}

interface SeedContributorProfile {
  type: ContributorType
  bio: string
  institutionName: string
  institutionType: InstitutionType
  socialLinks: SeedSocialLink[]
  department: string
  program: string
  designation: string
  isVerified: boolean
}

export interface SeedUser {
  username: string
  email: string
  name: string
  role: UserRole
  bio: string
  avatarUrl: string
  provider: "google" | "github"
  createdAt: Date
  profile?: SeedContributorProfile
}

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function avatar(seed: string, style = "notionists") {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`
}

export const seedUsers: SeedUser[] = [
  {
    username: "seed-admin",
    email: "seed-admin@opennotes.test",
    name: "Olivia Admin",
    role: "ADMIN",
    bio: "Test administrator for moderation and platform management.",
    avatarUrl: avatar("Olivia Admin", "avataaars"),
    provider: "google",
    createdAt: daysAgo(420),
  },
  {
    username: "seed-moderator",
    email: "seed-moderator@opennotes.test",
    name: "Marcus Moderator",
    role: "MODERATOR",
    bio: "Test moderator focused on educational content quality.",
    avatarUrl: avatar("Marcus Moderator", "avataaars"),
    provider: "github",
    createdAt: daysAgo(390),
  },
  {
    username: "aarav-sharma",
    email: "aarav.sharma@opennotes.test",
    name: "Aarav Sharma",
    role: "USER",
    bio: "Computer science student sharing concise programming and mathematics notes.",
    avatarUrl: avatar("Aarav Sharma"),
    provider: "google",
    createdAt: daysAgo(360),
    profile: {
      type: "STUDENT",
      bio: "BCA student interested in algorithms, web development, and open education.",
      institutionName: "Himalaya College of Engineering",
      institutionType: "COLLEGE",
      socialLinks: [
        { platform: "GITHUB", url: "https://github.com/aarav-sharma" },
        { platform: "LINKEDIN", url: "https://linkedin.com/in/aarav-sharma" },
      ],
      department: "Computer Applications",
      program: "Bachelor of Computer Applications",
      designation: "Student",
      isVerified: true,
    },
  },
  {
    username: "sneha-patel",
    email: "sneha.patel@opennotes.test",
    name: "Sneha Patel",
    role: "USER",
    bio: "Biology teacher creating visual revision material for secondary students.",
    avatarUrl: avatar("Sneha Patel", "lorelei"),
    provider: "github",
    createdAt: daysAgo(340),
    profile: {
      type: "TEACHER",
      bio: "Biology educator with a focus on diagram-based learning and exam revision.",
      institutionName: "Evergreen Secondary School",
      institutionType: "SCHOOL",
      socialLinks: [
        { platform: "YOUTUBE", url: "https://youtube.com/@snehapatelnotes" },
        { platform: "WEBSITE", url: "https://example.com/sneha-patel" },
      ],
      department: "Science",
      program: "+2 Biology",
      designation: "Science Teacher",
      isVerified: true,
    },
  },
  {
    username: "bikash-thapa",
    email: "bikash.thapa@opennotes.test",
    name: "Bikash Thapa",
    role: "USER",
    bio: "Physics graduate publishing worked examples and formula summaries.",
    avatarUrl: avatar("Bikash Thapa", "adventurer"),
    provider: "google",
    createdAt: daysAgo(320),
    profile: {
      type: "PROFESSIONAL",
      bio: "Physics graduate and private tutor helping students build strong fundamentals.",
      institutionName: "Kathmandu Learning Hub",
      institutionType: "OTHER",
      socialLinks: [
        { platform: "X", url: "https://x.com/bikashthapa" },
        { platform: "TELEGRAM", url: "https://t.me/bikashthapa" },
      ],
      department: "Physics",
      program: "BSc Physics",
      designation: "Physics Tutor",
      isVerified: false,
    },
  },
  {
    username: "open-study-circle",
    email: "community@opennotes.test",
    name: "Open Study Circle",
    role: "USER",
    bio: "A volunteer study community publishing collaborative revision resources.",
    avatarUrl: avatar("Open Study Circle", "bottts"),
    provider: "github",
    createdAt: daysAgo(300),
    profile: {
      type: "ORGANIZATION",
      bio: "Volunteer-run collective creating free study guides for students everywhere.",
      institutionName: "Open Study Circle",
      institutionType: "OTHER",
      socialLinks: [
        { platform: "DISCORD", url: "https://discord.gg/open-study-circle" },
        { platform: "WEBSITE", url: "https://example.com/open-study-circle" },
      ],
      department: "Education",
      program: "Community Learning",
      designation: "Volunteer Organization",
      isVerified: true,
    },
  },
  {
    username: "maya-gurung",
    email: "maya.gurung@opennotes.test",
    name: "Maya Gurung",
    role: "USER",
    bio: "Independent researcher curating data science and research methodology notes.",
    avatarUrl: avatar("Maya Gurung", "lorelei"),
    provider: "google",
    createdAt: daysAgo(280),
    profile: {
      type: "INDEPENDENT",
      bio: "Independent learner documenting practical data science and research methods.",
      institutionName: "Independent Research Collective",
      institutionType: "OTHER",
      socialLinks: [
        { platform: "GITHUB", url: "https://github.com/mayagurung" },
        { platform: "INSTAGRAM", url: "https://instagram.com/mayagurung" },
      ],
      department: "Data Science",
      program: "Machine Learning",
      designation: "Independent Researcher",
      isVerified: false,
    },
  },
  {
    username: "rohan-verma",
    email: "rohan.verma@opennotes.test",
    name: "Rohan Verma",
    role: "USER",
    bio: "Economics student sharing revision notes and practice questions.",
    avatarUrl: avatar("Rohan Verma", "adventurer"),
    provider: "github",
    createdAt: daysAgo(260),
    profile: {
      type: "STUDENT",
      bio: "BBA student interested in microeconomics, accounting, and public policy.",
      institutionName: "Lumbini College of Management",
      institutionType: "COLLEGE",
      socialLinks: [
        { platform: "LINKEDIN", url: "https://linkedin.com/in/rohanverma" },
      ],
      department: "Management",
      program: "Bachelor of Business Administration",
      designation: "Student",
      isVerified: false,
    },
  },
  {
    username: "anisha-rai",
    email: "anisha.rai@opennotes.test",
    name: "Anisha Rai",
    role: "USER",
    bio: "Languages educator publishing literature and history study guides.",
    avatarUrl: avatar("Anisha Rai", "lorelei"),
    provider: "google",
    createdAt: daysAgo(240),
    profile: {
      type: "TEACHER",
      bio: "Nepali and history teacher creating approachable literature revision guides.",
      institutionName: "Riverdale Higher Secondary School",
      institutionType: "SCHOOL",
      socialLinks: [
        { platform: "YOUTUBE", url: "https://youtube.com/@anisharai" },
        { platform: "FACEBOOK", url: "https://facebook.com/anisharai" },
      ],
      department: "Humanities",
      program: "Nepali and History",
      designation: "Humanities Teacher",
      isVerified: true,
    },
  },
  {
    username: "dipak-kc",
    email: "dipak.kc@opennotes.test",
    name: "Dipak KC",
    role: "USER",
    bio: "Chemistry graduate publishing structured lecture and lab notes.",
    avatarUrl: avatar("Dipak KC", "avataaars"),
    provider: "github",
    createdAt: daysAgo(220),
    profile: {
      type: "PROFESSIONAL",
      bio: "Chemistry graduate working in education and laboratory training.",
      institutionName: "Himalaya Science Academy",
      institutionType: "COLLEGE",
      socialLinks: [
        { platform: "GITHUB", url: "https://github.com/dipakkc" },
        { platform: "WEBSITE", url: "https://example.com/dipak-kc" },
      ],
      department: "Chemistry",
      program: "BSc Chemistry",
      designation: "Laboratory Instructor",
      isVerified: false,
    },
  },
  {
    username: "test-reader",
    email: "test-reader@opennotes.test",
    name: "Taylor Reader",
    role: "USER",
    bio: "Test reader with saved notes, collections, and reports.",
    avatarUrl: avatar("Taylor Reader", "avataaars"),
    provider: "google",
    createdAt: daysAgo(180),
  },
  {
    username: "test-reader-two",
    email: "test-reader-two@opennotes.test",
    name: "Jordan Reader",
    role: "USER",
    bio: "Second test reader for bookmarks and collection interactions.",
    avatarUrl: avatar("Jordan Reader", "avataaars"),
    provider: "github",
    createdAt: daysAgo(160),
  },
]

export const SEED_PDF_FILES = [
  {
    key: "biology",
    fileKey: "6b06e855ead997d09a9b093a",
    fileSizeBytes: 2_450_000,
    pageCount: 18,
  },
  {
    key: "nodejs",
    fileKey: "6aaf4aeaead997d09aa191dd",
    fileSizeBytes: 1_820_000,
    pageCount: 14,
  },
  {
    key: "calculus",
    fileKey: "6aaf5088ead997d09ab9a638",
    fileSizeBytes: 2_120_000,
    pageCount: 16,
  },
] as const

interface NoteTopic {
  slug: string
  title: string
  subject: string
  educationLevel: string
  course: string
  grade: string
  topic: string
  tags: string[]
  description: string
}

const NOTE_TOPICS: NoteTopic[] = [
  {
    slug: "cell-structure",
    title: "Cell Structure and Organelles",
    subject: "biology",
    educationLevel: "plus-two",
    course: "plus-two-science",
    grade: "grade-11",
    topic: "Cell biology",
    tags: ["cells", "organelles", "microscopy"],
    description:
      "Explore prokaryotic and eukaryotic cells, membrane transport, and organelle functions.",
  },
  {
    slug: "newtons-laws",
    title: "Newton's Laws of Motion",
    subject: "physics",
    educationLevel: "school",
    course: "school-general",
    grade: "grade-10",
    topic: "Classical mechanics",
    tags: ["mechanics", "forces", "motion"],
    description:
      "Understand inertia, acceleration, action-reaction pairs, and free-body diagrams.",
  },
  {
    slug: "chemical-bonding",
    title: "Chemical Bonding",
    subject: "chemistry",
    educationLevel: "plus-two",
    course: "plus-two-science",
    grade: "grade-11",
    topic: "Atomic structure",
    tags: ["ionic", "covalent", "bonding"],
    description:
      "Compare ionic, covalent, and metallic bonds with molecular geometry examples.",
  },
  {
    slug: "differential-calculus",
    title: "Differential Calculus",
    subject: "mathematics",
    educationLevel: "bachelor",
    course: "bsc",
    grade: "bachelor-year-1",
    topic: "Derivatives",
    tags: ["derivatives", "limits", "calculus"],
    description:
      "Work through limits, differentiation rules, implicit derivatives, and applications.",
  },
  {
    slug: "javascript-closures",
    title: "JavaScript Closures",
    subject: "computer-science",
    educationLevel: "bachelor",
    course: "bca",
    grade: "bachelor-year-2",
    topic: "JavaScript",
    tags: ["javascript", "closures", "scope"],
    description:
      "Learn lexical scope, closures, callbacks, and practical functional patterns.",
  },
  {
    slug: "tree-data-structures",
    title: "Data Structures: Trees",
    subject: "data-structures-and-algorithms",
    educationLevel: "bachelor",
    course: "bcsit",
    grade: "bachelor-year-2",
    topic: "Trees",
    tags: ["trees", "bst", "algorithms"],
    description:
      "Study binary trees, binary search trees, traversals, balancing, and complexity.",
  },
  {
    slug: "sql-joins-indexing",
    title: "SQL Joins and Indexing",
    subject: "database-management-systems",
    educationLevel: "bachelor",
    course: "bit",
    grade: "bachelor-year-3",
    topic: "Relational databases",
    tags: ["sql", "joins", "indexes"],
    description:
      "Practice inner and outer joins, query planning, normalization, and index selection.",
  },
  {
    slug: "human-digestive-system",
    title: "Human Digestive System",
    subject: "biology",
    educationLevel: "school",
    course: "school-general",
    grade: "grade-9",
    topic: "Human physiology",
    tags: ["digestion", "nutrition", "physiology"],
    description:
      "Follow food through the alimentary canal and review enzymes and nutrient absorption.",
  },
  {
    slug: "thermodynamics-basics",
    title: "Thermodynamics Basics",
    subject: "physics",
    educationLevel: "bachelor",
    course: "bsc-physics",
    grade: "bachelor-year-2",
    topic: "Thermodynamics",
    tags: ["heat", "entropy", "energy"],
    description:
      "Review the laws of thermodynamics, heat engines, entropy, and cyclic processes.",
  },
  {
    slug: "organic-reactions",
    title: "Organic Reaction Mechanisms",
    subject: "chemistry",
    educationLevel: "bachelor",
    course: "bsc",
    grade: "bachelor-year-2",
    topic: "Organic chemistry",
    tags: ["organic", "reactions", "mechanisms"],
    description:
      "Analyze substitution, addition, elimination, and common reaction intermediates.",
  },
  {
    slug: "probability-distributions",
    title: "Probability Distributions",
    subject: "statistics",
    educationLevel: "bachelor",
    course: "bsc-mathematics",
    grade: "bachelor-year-2",
    topic: "Probability",
    tags: ["probability", "distributions", "statistics"],
    description:
      "Compare binomial, Poisson, and normal distributions with worked problems.",
  },
  {
    slug: "operating-system-scheduling",
    title: "Operating System Scheduling",
    subject: "operating-systems",
    educationLevel: "bachelor",
    course: "be-computer",
    grade: "bachelor-year-3",
    topic: "CPU scheduling",
    tags: ["operating-systems", "scheduling", "processes"],
    description:
      "Evaluate FCFS, SJF, round-robin, and priority scheduling using numerical examples.",
  },
  {
    slug: "computer-network-layers",
    title: "Computer Network Layers",
    subject: "computer-networks",
    educationLevel: "bachelor",
    course: "bim",
    grade: "bachelor-year-3",
    topic: "Network models",
    tags: ["networking", "osi", "tcp-ip"],
    description:
      "Map OSI and TCP/IP layers, protocols, addressing, routing, and error control.",
  },
  {
    slug: "microeconomic-demand",
    title: "Microeconomic Demand",
    subject: "economics",
    educationLevel: "bachelor",
    course: "bba",
    grade: "bachelor-year-1",
    topic: "Demand theory",
    tags: ["economics", "demand", "elasticity"],
    description:
      "Explain utility, demand curves, market equilibrium, and elasticity of demand.",
  },
  {
    slug: "financial-accounting",
    title: "Financial Accounting Fundamentals",
    subject: "accounting",
    educationLevel: "bachelor",
    course: "bbs",
    grade: "bachelor-year-1",
    topic: "Accounting cycle",
    tags: ["accounting", "ledger", "statements"],
    description:
      "Review journals, ledgers, trial balance, adjustments, and financial statements.",
  },
  {
    slug: "nepali-romanticism",
    title: "Nepali Literature: Romanticism",
    subject: "nepali",
    educationLevel: "bachelor",
    course: "ba",
    grade: "bachelor-year-2",
    topic: "Literary movements",
    tags: ["nepali", "literature", "romanticism"],
    description:
      "Examine major Romantic poets, themes, literary devices, and historical context.",
  },
  {
    slug: "world-war-one",
    title: "Causes of World War I",
    subject: "history",
    educationLevel: "school",
    course: "school-general",
    grade: "grade-10",
    topic: "Modern history",
    tags: ["history", "world-war", "europe"],
    description:
      "Trace militarism, alliances, imperialism, nationalism, and the July Crisis.",
  },
  {
    slug: "environmental-ecosystems",
    title: "Environmental Ecosystems",
    subject: "environmental-science",
    educationLevel: "bachelor",
    course: "bsc-environmental-science",
    grade: "bachelor-year-2",
    topic: "Ecology",
    tags: ["ecology", "ecosystems", "biodiversity"],
    description:
      "Study energy flow, food webs, nutrient cycles, succession, and biodiversity.",
  },
  {
    slug: "machine-learning-foundations",
    title: "Machine Learning Foundations",
    subject: "machine-learning",
    educationLevel: "master",
    course: "msc-computer-science",
    grade: "master-year-1",
    topic: "Supervised learning",
    tags: ["machine-learning", "regression", "classification"],
    description:
      "Introduce supervised learning, model evaluation, bias, variance, and validation.",
  },
  {
    slug: "research-methodology",
    title: "Research Methodology",
    subject: "education",
    educationLevel: "master",
    course: "med",
    grade: "master-year-1",
    topic: "Research design",
    tags: ["research", "methodology", "academic-writing"],
    description:
      "Compare qualitative, quantitative, and mixed-method research designs.",
  },
]

const NOTE_FORMATS = [
  {
    slug: "complete-notes",
    name: "Complete Lecture Notes",
    category: "lecture-notes",
    description:
      "A structured lesson with definitions, explanations, and worked examples.",
  },
  {
    slug: "revision-guide",
    name: "Exam Revision Guide",
    category: "revision-notes",
    description:
      "A concise revision resource with key concepts, summaries, and checkpoints.",
  },
  {
    slug: "practice-questions",
    name: "Practice Questions and Answers",
    category: "practice-questions",
    description:
      "A practice set with representative questions and explained answers.",
  },
] as const

const STATUS_PATTERN: NoteStatus[] = [
  "PUBLISHED",
  "PUBLISHED",
  "PENDING_REVIEW",
  "PUBLISHED",
  "DRAFT",
  "PUBLISHED",
  "REJECTED",
  "PUBLISHED",
  "REMOVED",
  "PUBLISHED",
]

export interface SeedNote {
  slug: string
  title: string
  description: string
  contributorUsername: string
  subject: string
  category: string
  sourceType: NoteSourceType
  originalAuthor: string | null
  sourceUrl: string | null
  educationLevel: string
  course: string
  grade: string
  topic: string
  academicYear: string
  fileKey: string
  fileHash: string
  fileSizeBytes: number
  pageCount: number
  processingStatus: ProcessingStatus
  status: NoteStatus
  downloadCount: number
  viewCount: number
  rejectionReason: string | null
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  tags: string[]
}

const noteContributors = seedUsers.slice(2, 10)

export const seedNotes: SeedNote[] = NOTE_TOPICS.flatMap((topic, topicIndex) =>
  NOTE_FORMATS.map((format, formatIndex) => {
    const index = topicIndex * NOTE_FORMATS.length + formatIndex
    const slug = `seed-${topic.slug}-${format.slug}`
    const status = STATUS_PATTERN[index % STATUS_PATTERN.length]
    const isPublished = status === "PUBLISHED"
    const hasPublishedHistory = isPublished || status === "REMOVED"
    const file = SEED_PDF_FILES[index % SEED_PDF_FILES.length]
    const createdAt = daysAgo(200 - (index % 140))
    const publishedAt = hasPublishedHistory
      ? daysAgo(5 + ((index * 11) % 170))
      : null

    return {
      slug,
      title: `${topic.title}: ${format.name}`,
      description: `${format.description} ${topic.description} This record is dummy content for testing.`,
      contributorUsername:
        noteContributors[(topicIndex + formatIndex) % noteContributors.length]
          .username,
      subject: topic.subject,
      category: format.category,
      sourceType: index % 13 === 0 ? "OPEN_LICENSE" : "ORIGINAL",
      originalAuthor: index % 13 === 0 ? "Open educational community" : null,
      sourceUrl: index % 13 === 0 ? "https://openstax.org" : null,
      educationLevel: topic.educationLevel,
      course: topic.course,
      grade: topic.grade,
      topic: topic.topic,
      academicYear: "2026",
      fileKey: file.fileKey,
      fileHash: createHash("sha256").update(`opennotes:${slug}`).digest("hex"),
      fileSizeBytes: file.fileSizeBytes,
      pageCount: file.pageCount,
      processingStatus:
        status === "DRAFT"
          ? index % 4 === 0
            ? "FAILED"
            : "PROCESSING"
          : "READY",
      status,
      downloadCount: isPublished
        ? index % 19 === 0
          ? 12_500 + index * 37
          : 35 + ((index * 97) % 1_400)
        : 0,
      viewCount: isPublished
        ? index % 19 === 0
          ? 42_000 + index * 113
          : 150 + ((index * 317) % 6_800)
        : 0,
      rejectionReason:
        status === "REJECTED"
          ? "The submission needs clearer attribution and more complete explanations."
          : null,
      createdAt,
      updatedAt: publishedAt ?? daysAgo(15 + (index % 35)),
      publishedAt,
      tags: [...topic.tags, "test-data"],
    }
  })
)

export interface SeedCollection {
  key: string
  ownerUsername: string
  parentKey: string | null
  name: string
  slug: string
  description: string
  visibility: "PRIVATE" | "PUBLIC"
  position: number
  noteIndexes: number[]
}

export const seedCollections: SeedCollection[] = [
  {
    key: "computer-science",
    ownerUsername: "aarav-sharma",
    parentKey: null,
    name: "Computer Science Essentials",
    slug: "seed-computer-science-essentials",
    description:
      "Programming, databases, networks, and machine learning study resources.",
    visibility: "PUBLIC",
    position: 0,
    noteIndexes: [12, 13, 15, 16, 18, 19, 33, 34, 36, 37, 54, 55],
  },
  {
    key: "algorithms",
    ownerUsername: "aarav-sharma",
    parentKey: "computer-science",
    name: "Algorithms and Data Structures",
    slug: "seed-algorithms-and-data-structures",
    description:
      "Tree traversals, complexity analysis, and algorithm practice.",
    visibility: "PUBLIC",
    position: 0,
    noteIndexes: [15, 16, 17],
  },
  {
    key: "networking",
    ownerUsername: "aarav-sharma",
    parentKey: "computer-science",
    name: "Computer Networks",
    slug: "seed-computer-networks",
    description: "Network models, protocols, and addressing revision notes.",
    visibility: "PUBLIC",
    position: 1,
    noteIndexes: [36, 37, 38],
  },
  {
    key: "web-development",
    ownerUsername: "aarav-sharma",
    parentKey: null,
    name: "Web Development",
    slug: "seed-web-development",
    description: "JavaScript fundamentals and practical programming guides.",
    visibility: "PRIVATE",
    position: 1,
    noteIndexes: [12, 13, 14],
  },
  {
    key: "biology",
    ownerUsername: "sneha-patel",
    parentKey: null,
    name: "Biology Exam Pack",
    slug: "seed-biology-exam-pack",
    description: "Cell biology, physiology, and ecology revision resources.",
    visibility: "PUBLIC",
    position: 0,
    noteIndexes: [0, 1, 2, 21, 22, 51, 52],
  },
  {
    key: "physics",
    ownerUsername: "bikash-thapa",
    parentKey: null,
    name: "Physics fundamentals",
    slug: "seed-physics-fundamentals",
    description: "Mechanics and thermodynamics notes with worked examples.",
    visibility: "PUBLIC",
    position: 0,
    noteIndexes: [3, 4, 5, 24, 25, 26],
  },
  {
    key: "chemistry",
    ownerUsername: "dipak-kc",
    parentKey: null,
    name: "Chemistry Lecture Notes",
    slug: "seed-chemistry-lecture-notes",
    description: "Bonding and organic chemistry resources for revision.",
    visibility: "PUBLIC",
    position: 0,
    noteIndexes: [6, 7, 8, 27, 28, 29],
  },
  {
    key: "mathematics",
    ownerUsername: "open-study-circle",
    parentKey: null,
    name: "Mathematics Revision Library",
    slug: "seed-mathematics-revision-library",
    description:
      "Calculus and probability guides contributed by the community.",
    visibility: "PUBLIC",
    position: 0,
    noteIndexes: [9, 10, 11, 30, 31, 32],
  },
  {
    key: "economics",
    ownerUsername: "rohan-verma",
    parentKey: null,
    name: "Economics and Accounting",
    slug: "seed-economics-and-accounting",
    description: "Demand theory and financial accounting study material.",
    visibility: "PUBLIC",
    position: 0,
    noteIndexes: [39, 40, 41, 42, 43, 44],
  },
  {
    key: "nepali-literature",
    ownerUsername: "anisha-rai",
    parentKey: null,
    name: "Nepali Literature Notes",
    slug: "seed-nepali-literature-notes",
    description: "Literary movements, authors, themes, and exam questions.",
    visibility: "PRIVATE",
    position: 0,
    noteIndexes: [45, 46, 47],
  },
  {
    key: "history",
    ownerUsername: "anisha-rai",
    parentKey: null,
    name: "Modern History",
    slug: "seed-modern-history",
    description: "World history guides for classroom and independent study.",
    visibility: "PUBLIC",
    position: 1,
    noteIndexes: [48, 49, 50],
  },
  {
    key: "data-science",
    ownerUsername: "maya-gurung",
    parentKey: null,
    name: "Data Science Reading List",
    slug: "seed-data-science-reading-list",
    description: "Machine learning and research methodology resources.",
    visibility: "PUBLIC",
    position: 0,
    noteIndexes: [54, 55, 56, 57, 58, 59],
  },
  {
    key: "community-revision",
    ownerUsername: "open-study-circle",
    parentKey: null,
    name: "Community Revision Exchange",
    slug: "seed-community-revision-exchange",
    description:
      "A broad collection of concise revision guides across subjects.",
    visibility: "PUBLIC",
    position: 1,
    noteIndexes: [
      2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56,
      59,
    ],
  },
  {
    key: "saved-semester",
    ownerUsername: "test-reader",
    parentKey: null,
    name: "Saved for Next Semester",
    slug: "seed-saved-for-next-semester",
    description: "A private reading list for upcoming courses.",
    visibility: "PRIVATE",
    position: 0,
    noteIndexes: [3, 10, 19, 28, 37, 46, 55],
  },
]
