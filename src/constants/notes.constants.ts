export const MAX_NOTE_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export const MAX_NOTE_FILE_SIZE_LABEL = "10 MB"

export const ALLOWED_NOTE_FILE_MIME_TYPES = ["application/pdf"] as const

export const ALLOWED_NOTE_FILE_EXTENSION = ".pdf"

export const NOTE_TITLE_MIN_LENGTH = 3
export const NOTE_TITLE_MAX_LENGTH = 255
export const NOTE_DESCRIPTION_MAX_LENGTH = 2000
export const NOTE_EDUCATION_LEVEL_MAX_LENGTH = 64
export const NOTE_GRADE_MAX_LENGTH = 64
export const NOTE_TOPIC_MAX_LENGTH = 128
export const NOTE_ACADEMIC_YEAR_MAX_LENGTH = 16

export const NOTES_IMAGEKIT_FOLDER = (userId: string) => `/notes/${userId}`

export const SUBJECTS = [
  // Science
  { id: "physics", name: "Physics" },
  { id: "chemistry", name: "Chemistry" },
  { id: "biology", name: "Biology" },
  { id: "environmental-science", name: "Environmental Science" },
  { id: "earth-science", name: "Earth Science" },
  { id: "astronomy", name: "Astronomy" },

  // Mathematics
  { id: "mathematics", name: "Mathematics" },
  { id: "algebra", name: "Algebra" },
  { id: "linear-algebra", name: "Linear Algebra" },
  { id: "geometry", name: "Geometry" },
  { id: "calculus", name: "Calculus" },
  { id: "statistics", name: "Statistics" },
  { id: "probability", name: "Probability" },
  { id: "discrete-mathematics", name: "Discrete Mathematics" },
  { id: "discrete-structures", name: "Discrete Structures" },
  {
    id: "calculus-and-analytical-geometry",
    name: "Calculus & Analytical Geometry",
  },

  // Computer Science
  { id: "computer-science", name: "Computer Science" },
  { id: "c-programming", name: "C Programming" },
  { id: "object-oriented-programming", name: "Object Oriented Programming" },
  { id: "digital-logic", name: "Digital Logic" },
  { id: "programming", name: "Programming" },
  { id: "microprocessor", name: "Microprocessor" },
  {
    id: "data-structures-and-algorithms",
    name: "Data Structures and Algorithms",
  },
  { id: "database-management-systems", name: "Database Management  Systems" },
  { id: "operating-systems", name: "Operating Systems" },
  { id: "computer-networks", name: "Computer Networks" },
  { id: "software-engineering", name: "Software Engineering" },
  { id: "web-development", name: "Web Development" },
  { id: "artificial-intelligence", name: "Artificial Intelligence" },
  { id: "machine-learning", name: "Machine Learning" },
  { id: "cyber-security", name: "Cyber Security" },
  { id: "computer-architecture", name: "Computer Architecture" },
  { id: "numerical-methods", name: "Numerical Methods" },
  { id: "cryptography", name: "Cryptography" },
  { id: "modeling-and-simulation", name: "Modeling & Simulation" },
  { id: "compiler-design", name: "Compiler Design" },
  { id: "computer-graphics", name: "Computer Graphics" },

  // Engineering
  { id: "engineering", name: "Engineering" },
  { id: "civil-engineering", name: "Civil Engineering" },
  { id: "mechanical-engineering", name: "Mechanical Engineering" },
  { id: "electrical-engineering", name: "Electrical Engineering" },
  { id: "electronics-engineering", name: "Electronics Engineering" },
  { id: "computer-engineering", name: "Computer Engineering" },
  { id: "chemical-engineering", name: "Chemical Engineering" },
  { id: "architecture", name: "Architecture" },

  // Business
  { id: "business", name: "Business" },
  { id: "accounting", name: "Accounting" },
  { id: "finance", name: "Finance" },
  { id: "economics", name: "Economics" },
  { id: "marketing", name: "Marketing" },
  { id: "management", name: "Management" },
  { id: "entrepreneurship", name: "Entrepreneurship" },
  { id: "business-law", name: "Business Law" },

  // Social Sciences
  { id: "social-science", name: "Social Science" },
  { id: "sociology", name: "Sociology" },
  { id: "psychology", name: "Psychology" },
  { id: "political-science", name: "Political Science" },
  { id: "international-relations", name: "International Relations" },
  { id: "geography", name: "Geography" },
  { id: "anthropology", name: "Anthropology" },

  // Humanities
  { id: "humanities", name: "Humanities" },
  { id: "history", name: "History" },
  { id: "philosophy", name: "Philosophy" },
  { id: "literature", name: "Literature" },
  { id: "linguistics", name: "Linguistics" },
  { id: "religious-studies", name: "Religious Studies" },

  // Languages
  { id: "english", name: "English" },
  { id: "nepali", name: "Nepali" },
  { id: "hindi", name: "Hindi" },
  { id: "sanskrit", name: "Sanskrit" },
  { id: "foreign-languages", name: "Foreign Languages" },

  // Medicine & Health
  { id: "medicine", name: "Medicine" },
  { id: "nursing", name: "Nursing" },
  { id: "pharmacy", name: "Pharmacy" },
  { id: "public-health", name: "Public Health" },
  { id: "anatomy", name: "Anatomy" },
  { id: "physiology", name: "Physiology" },
  { id: "pathology", name: "Pathology" },
  { id: "microbiology", name: "Microbiology" },

  // Education
  { id: "education", name: "Education" },
  { id: "early-childhood-education", name: "Early Childhood Education" },
  { id: "educational-psychology", name: "Educational Psychology" },

  // Arts & Design
  { id: "arts", name: "Arts" },
  { id: "fine-arts", name: "Fine Arts" },
  { id: "graphic-design", name: "Graphic Design" },
  { id: "ui-ux-design", name: "UI/UX Design" },
  { id: "photography", name: "Photography" },
  { id: "music", name: "Music" },
  { id: "film-studies", name: "Film Studies" },

  // Law
  { id: "law", name: "Law" },
  { id: "constitutional-law", name: "Constitutional Law" },
  { id: "criminal-law", name: "Criminal Law" },
  { id: "civil-law", name: "Civil Law" },
  { id: "international-law", name: "International Law" },

  // Agriculture
  { id: "agriculture", name: "Agriculture" },
  { id: "agronomy", name: "Agronomy" },
  { id: "horticulture", name: "Horticulture" },
  { id: "forestry", name: "Forestry" },
  { id: "animal-science", name: "Animal Science" },

  // Other
  { id: "food-science", name: "Food Science" },
  { id: "tourism", name: "Tourism" },
  { id: "hospitality", name: "Hospitality" },
  { id: "journalism", name: "Journalism" },
  { id: "communication", name: "Communication" },
  { id: "sports-science", name: "Sports Science" },
]

export const NOTES_CATEGORIES = [
  { id: "general", name: "General" },

  // Study Material
  { id: "lecture-notes", name: "Lecture Notes" },
  { id: "class-notes", name: "Class Notes" },
  { id: "handwritten-notes", name: "Handwritten Notes" },
  { id: "digital-notes", name: "Digital Notes" },
  { id: "study-material", name: "Study Material" },
  { id: "course-material", name: "Course Material" },
  { id: "reading-material", name: "Reading Material" },

  // Exam Preparation
  { id: "exam-notes", name: "Exam Notes" },
  { id: "revision-notes", name: "Revision Notes" },
  { id: "quick-revision", name: "Quick Revision" },
  { id: "exam-preparation", name: "Exam Preparation" },
  { id: "important-questions", name: "Important Questions" },
  { id: "question-bank", name: "Question Bank" },
  { id: "previous-year-questions", name: "Previous Year Questions" },
  { id: "model-questions", name: "Model Questions" },
  { id: "practice-questions", name: "Practice Questions" },

  // Academic
  { id: "assignments", name: "Assignments" },
  { id: "tutorials", name: "Tutorials" },
  { id: "lab-notes", name: "Lab Notes" },
  { id: "lab-reports", name: "Lab Reports" },
  { id: "projects", name: "Projects" },
  { id: "project-reports", name: "Project Reports" },
  { id: "case-studies", name: "Case Studies" },

  // Resources
  { id: "ebooks", name: "eBooks" },
  { id: "textbooks", name: "Textbooks" },
  { id: "reference-material", name: "Reference Material" },
  { id: "cheat-sheets", name: "Cheat Sheets" },
  { id: "summaries", name: "Summaries" },
  { id: "formula-sheets", name: "Formula Sheets" },
  { id: "definitions", name: "Definitions" },

  // Courses
  { id: "syllabus", name: "Syllabus" },
  { id: "course-outline", name: "Course Outline" },
  { id: "unit-notes", name: "Unit Notes" },
  { id: "chapter-notes", name: "Chapter Notes" },
  { id: "topic-notes", name: "Topic Notes" },

  // Competitive Exams
  { id: "entrance-exam", name: "Entrance Exam" },
  { id: "competitive-exam", name: "Competitive Exam" },
  { id: "board-exam", name: "Board Exam" },
  { id: "neet", name: "NEET" },
  { id: "jee", name: "JEE" },
  { id: "lok-sewa", name: "Lok Sewa" },
  { id: "teaching-license", name: "Teaching License" },
  { id: "ioe", name: "I.O.E" },
  { id: "cee", name: "C.E.E" },

  // Professional
  { id: "certification", name: "Certification" },
  { id: "professional-development", name: "Professional Development" },
  { id: "research-papers", name: "Research Papers" },
  { id: "thesis", name: "Thesis" },
  { id: "dissertation", name: "Dissertation" },

  // Miscellaneous
  { id: "presentation", name: "Presentation" },
  { id: "seminar", name: "Seminar" },
  { id: "workshop", name: "Workshop" },
  { id: "reference", name: "Reference" },
  { id: "other", name: "Other" },
]

export const EDUCATIONAL_LEVELS = [
  { id: "school", name: "School" },
  { id: "plus-two", name: "+2" },
  { id: "diploma", name: "Diploma" },
  { id: "bachelor", name: "Bachelor's" },
  { id: "master", name: "Master's" },
  { id: "mphil", name: "MPhil" },
  { id: "phd", name: "PhD" },
  { id: "vocational", name: "Vocational / Technical" },
  { id: "professional", name: "Professional" },
  { id: "competitive-exam", name: "Competitive Exam" },
  { id: "other", name: "Other" },
]

export const COURSE_LEVELS = [
  // School
  {
    id: "school-general",
    name: "School / General",
    level: "school",
  },

  // +2
  {
    id: "plus-two-science",
    name: "+2 Science",
    level: "plus-two",
  },
  {
    id: "plus-two-management",
    name: "+2 Management",
    level: "plus-two",
  },
  {
    id: "plus-two-humanities",
    name: "+2 Humanities",
    level: "plus-two",
  },
  {
    id: "plus-two-education",
    name: "+2 Education",
    level: "plus-two",
  },
  {
    id: "plus-two-law",
    name: "+2 Law",
    level: "plus-two",
  },
  {
    id: "plus-two-technical",
    name: "+2 Technical",
    level: "plus-two",
  },

  // Diploma / Technical
  {
    id: "diploma-civil-engineering",
    name: "Diploma in Civil Engineering",
    level: "diploma",
  },
  {
    id: "diploma-computer-engineering",
    name: "Diploma in Computer Engineering",
    level: "diploma",
  },
  {
    id: "diploma-electrical-engineering",
    name: "Diploma in Electrical Engineering",
    level: "diploma",
  },
  {
    id: "diploma-electronics-engineering",
    name: "Diploma in Electronics Engineering",
    level: "diploma",
  },
  {
    id: "diploma-information-technology",
    name: "Diploma in Information Technology",
    level: "diploma",
  },
  {
    id: "diploma-architecture",
    name: "Diploma in Architecture",
    level: "diploma",
  },
  {
    id: "diploma-pharmacy",
    name: "Diploma in Pharmacy",
    level: "diploma",
  },
  {
    id: "diploma-agriculture",
    name: "Diploma in Agriculture",
    level: "diploma",
  },
  {
    id: "diploma-hotel-management",
    name: "Diploma in Hotel Management",
    level: "diploma",
  },
  {
    id: "diploma-health-science",
    name: "Diploma in Health Science",
    level: "diploma",
  },

  // Bachelor's - Computer / IT
  {
    id: "bca",
    name: "BCA",
    level: "bachelor",
  },
  {
    id: "bit",
    name: "BIT",
    level: "bachelor",
  },
  {
    id: "bcsit",
    name: "BCSIT",
    level: "bachelor",
  },
  {
    id: "bsc-csit",
    name: "BSc. CSIT",
    level: "bachelor",
  },
  {
    id: "bsc-computer-science",
    name: "BSc. Computer Science",
    level: "bachelor",
  },
  {
    id: "bim",
    name: "BIM",
    level: "bachelor",
  },
  {
    id: "bict",
    name: "BICT",
    level: "bachelor",
  },

  // Bachelor's - Management
  {
    id: "bba",
    name: "BBA",
    level: "bachelor",
  },
  {
    id: "bbs",
    name: "BBS",
    level: "bachelor",
  },
  {
    id: "bbm",
    name: "BBM",
    level: "bachelor",
  },
  {
    id: "bpa",
    name: "BPA",
    level: "bachelor",
  },

  // Bachelor's - Engineering
  {
    id: "be-civil",
    name: "BE Civil Engineering",
    level: "bachelor",
  },
  {
    id: "be-computer",
    name: "BE Computer Engineering",
    level: "bachelor",
  },
  {
    id: "be-electrical",
    name: "BE Electrical Engineering",
    level: "bachelor",
  },
  {
    id: "be-electronics",
    name: "BE Electronics Engineering",
    level: "bachelor",
  },
  {
    id: "be-electronics-communication",
    name: "BE Electronics, Communication & Information Engineering",
    level: "bachelor",
  },
  {
    id: "be-mechanical",
    name: "BE Mechanical Engineering",
    level: "bachelor",
  },
  {
    id: "be-architecture",
    name: "BE Architecture",
    level: "bachelor",
  },

  // Bachelor's - Science
  {
    id: "bsc",
    name: "BSc",
    level: "bachelor",
  },
  {
    id: "bsc-physics",
    name: "BSc. Physics",
    level: "bachelor",
  },
  {
    id: "bsc-mathematics",
    name: "BSc. Mathematics",
    level: "bachelor",
  },
  {
    id: "bsc-environmental-science",
    name: "BSc. Environmental Science",
    level: "bachelor",
  },

  // Bachelor's - Business / Hospitality
  {
    id: "bhm",
    name: "BHM",
    level: "bachelor",
  },
  {
    id: "bttm",
    name: "BTTM",
    level: "bachelor",
  },
  {
    id: "bhtm",
    name: "BHTM",
    level: "bachelor",
  },

  // Bachelor's - Arts / Education / Social Science
  {
    id: "ba",
    name: "BA",
    level: "bachelor",
  },
  {
    id: "bed",
    name: "BEd",
    level: "bachelor",
  },
  {
    id: "bsw",
    name: "BSW",
    level: "bachelor",
  },
  {
    id: "bpa-social",
    name: "Bachelor of Social Sciences",
    level: "bachelor",
  },

  // Bachelor's - Law
  {
    id: "llb",
    name: "LLB",
    level: "bachelor",
  },
  {
    id: "ba-llb",
    name: "BA LLB",
    level: "bachelor",
  },

  // Bachelor's - Medical / Health
  {
    id: "mbbs",
    name: "MBBS",
    level: "bachelor",
  },
  {
    id: "bds",
    name: "BDS",
    level: "bachelor",
  },
  {
    id: "bpharm",
    name: "BPharm",
    level: "bachelor",
  },
  {
    id: "bph",
    name: "BPH",
    level: "bachelor",
  },
  {
    id: "bsc-nursing",
    name: "BSc. Nursing",
    level: "bachelor",
  },
  {
    id: "bn",
    name: "BN",
    level: "bachelor",
  },
  {
    id: "bams",
    name: "BAMS",
    level: "bachelor",
  },
  {
    id: "bhms",
    name: "BHMS",
    level: "bachelor",
  },

  // Master's - Computer / IT
  {
    id: "mca",
    name: "MCA",
    level: "master",
  },
  {
    id: "mit",
    name: "MIT",
    level: "master",
  },
  {
    id: "msc-csit",
    name: "MSc. CSIT",
    level: "master",
  },
  {
    id: "msc-computer-science",
    name: "MSc. Computer Science",
    level: "master",
  },

  // Master's - Management
  {
    id: "mba",
    name: "MBA",
    level: "master",
  },
  {
    id: "mbs",
    name: "MBS",
    level: "master",
  },
  {
    id: "mhm",
    name: "MHM",
    level: "master",
  },

  // Master's - Science
  {
    id: "msc",
    name: "MSc",
    level: "master",
  },
  {
    id: "msc-physics",
    name: "MSc. Physics",
    level: "master",
  },
  {
    id: "msc-mathematics",
    name: "MSc. Mathematics",
    level: "master",
  },

  // Master's - Education / Arts
  {
    id: "med",
    name: "MEd",
    level: "master",
  },
  {
    id: "ma",
    name: "MA",
    level: "master",
  },
  {
    id: "msw",
    name: "MSW",
    level: "master",
  },

  // Master's - Engineering
  {
    id: "me-computer",
    name: "ME Computer Engineering",
    level: "master",
  },
  {
    id: "me-civil",
    name: "ME Civil Engineering",
    level: "master",
  },
  {
    id: "me-electronics",
    name: "ME Electronics Engineering",
    level: "master",
  },

  // Master's - Health
  {
    id: "mph",
    name: "MPH",
    level: "master",
  },
  {
    id: "msc-nursing",
    name: "MSc. Nursing",
    level: "master",
  },

  // MPhil
  {
    id: "mphil",
    name: "MPhil",
    level: "mphil",
  },

  // PhD
  {
    id: "phd",
    name: "PhD",
    level: "phd",
  },

  // Vocational / Technical
  {
    id: "tslc",
    name: "TSLC",
    level: "vocational",
  },
  {
    id: "ctevt",
    name: "CTEVT Program",
    level: "vocational",
  },
  {
    id: "technical-training",
    name: "Technical Training",
    level: "vocational",
  },

  // Professional
  {
    id: "ca",
    name: "CA",
    level: "professional",
  },
  {
    id: "acca",
    name: "ACCA",
    level: "professional",
  },
  {
    id: "cma",
    name: "CMA",
    level: "professional",
  },
  {
    id: "cs",
    name: "Company Secretary",
    level: "professional",
  },

  // Competitive Exams
  {
    id: "lok-sewa",
    name: "Lok Sewa Aayog",
    level: "competitive-exam",
  },
  {
    id: "teacher-service",
    name: "Teacher Service Commission",
    level: "competitive-exam",
  },
  {
    id: "banking-exams",
    name: "Banking Exams",
    level: "competitive-exam",
  },
  {
    id: "medical-entrance",
    name: "Medical Entrance",
    level: "competitive-exam",
  },
  {
    id: "engineering-entrance",
    name: "Engineering Entrance",
    level: "competitive-exam",
  },
  {
    id: "cee",
    name: "CEE",
    level: "competitive-exam",
  },
  {
    id: "other-competitive-exam",
    name: "Other Competitive Exam",
    level: "competitive-exam",
  },

  // Other
  {
    id: "other",
    name: "Other",
    level: "other",
  },
]

export const GRADES = [
  // School
  { id: "grade-1", name: "Grade 1", level: "school" },
  { id: "grade-2", name: "Grade 2", level: "school" },
  { id: "grade-3", name: "Grade 3", level: "school" },
  { id: "grade-4", name: "Grade 4", level: "school" },
  { id: "grade-5", name: "Grade 5", level: "school" },
  { id: "grade-6", name: "Grade 6", level: "school" },
  { id: "grade-7", name: "Grade 7", level: "school" },
  { id: "grade-8", name: "Grade 8", level: "school" },

  // Secondary
  { id: "grade-9", name: "Grade 9", level: "school" },
  { id: "grade-10", name: "Grade 10", level: "school" },

  // SEE
  { id: "see", name: "SEE", level: "see" },

  // +2
  { id: "grade-11", name: "Grade 11", level: "plus-two" },
  { id: "grade-12", name: "Grade 12", level: "plus-two" },

  // Diploma
  { id: "diploma-year-1", name: "1st Year", level: "diploma" },
  { id: "diploma-year-2", name: "2nd Year", level: "diploma" },
  { id: "diploma-year-3", name: "3rd Year", level: "diploma" },

  // Bachelor's
  { id: "bachelor-year-1", name: "1st Year", level: "bachelor" },
  { id: "bachelor-year-2", name: "2nd Year", level: "bachelor" },
  { id: "bachelor-year-3", name: "3rd Year", level: "bachelor" },
  { id: "bachelor-year-4", name: "4th Year", level: "bachelor" },

  // Bachelor's Semesters
  { id: "semester-1", name: "1st Semester", level: "bachelor" },
  { id: "semester-2", name: "2nd Semester", level: "bachelor" },
  { id: "semester-3", name: "3rd Semester", level: "bachelor" },
  { id: "semester-4", name: "4th Semester", level: "bachelor" },
  { id: "semester-5", name: "5th Semester", level: "bachelor" },
  { id: "semester-6", name: "6th Semester", level: "bachelor" },
  { id: "semester-7", name: "7th Semester", level: "bachelor" },
  { id: "semester-8", name: "8th Semester", level: "bachelor" },

  // Master's
  { id: "master-year-1", name: "1st Year", level: "master" },
  { id: "master-year-2", name: "2nd Year", level: "master" },

  // Master's Semesters
  { id: "master-semester-1", name: "1st Semester", level: "master" },
  { id: "master-semester-2", name: "2nd Semester", level: "master" },
  { id: "master-semester-3", name: "3rd Semester", level: "master" },
  { id: "master-semester-4", name: "4th Semester", level: "master" },

  // MPhil
  { id: "mphil-year-1", name: "1st Year", level: "mphil" },
  { id: "mphil-year-2", name: "2nd Year", level: "mphil" },

  // PhD
  { id: "phd-year-1", name: "1st Year", level: "phd" },
  { id: "phd-year-2", name: "2nd Year", level: "phd" },
  { id: "phd-year-3", name: "3rd Year", level: "phd" },
  { id: "phd-year-4", name: "4th Year", level: "phd" },

  // General
  { id: "all-levels", name: "All Levels", level: "other" },
  { id: "not-applicable", name: "Not Applicable", level: "other" },
]
