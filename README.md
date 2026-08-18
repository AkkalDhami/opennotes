# OpenNotes

> A public, community-driven platform for discovering, sharing, and accessing educational notes.

OpenNotes is an educational notes platform where students, teachers, and contributors can share useful study materials with learners everywhere.

![Hero Image](./public/hero.png)

The platform is designed to solve a simple problem: useful educational notes are often trapped inside private messaging groups, local devices, or individual classrooms. OpenNotes provides a public, searchable place where students can discover, view, download, and share educational resources.

[Website Link](https://opennotesbyme.vercel.app)

---

## ✨ Features

### 📚 Discover Notes

- Browse publicly available notes
- Search by title, subject, topic, contributor, and other metadata
- Filter notes by education level, grade, category, and more
- Sort by newest, most viewed, most downloaded, and relevance
- View detailed note information
- Discover related notes

### 📄 PDF Notes

- Upload PDF educational materials
- Browser-based PDF viewing
- Download public notes
- File size and type validation
- SHA-256 file hashing for duplicate detection
- PDF metadata such as page count and file size

### 👥 Contributors

- Public contributor profiles
- Contributor usernames
- Contributor biographies
- Published contributions
- Contribution statistics
- Contribution activity graph
- Contributor rankings
- Contributor badges and recognition

Contributors must also provide information about the source of material they upload.

This helps OpenNotes distinguish between content created by the contributor and material shared under another legitimate basis.

### 🔗 Sharing

Public notes have stable URLs that can be shared directly.

The platform is designed for classroom use, including:

- Smartboards
- Projectors
- Presentations
- Classroom computers
- Student phones

QR codes can also be generated for public notes so teachers can display a note on a classroom screen and allow students to scan it.

---

# 🧱 Tech Stack

## Frontend

- [Next.js](https://nextjs.org/)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Base UI
- Hugeicons
- React Hook Form
- Zod

## Backend

- Next.js App Router
- Server Components
- Server Actions
- Route Handlers
- TypeScript

## Database

- PostgreSQL
- Drizzle ORM

## Authentication

OpenNotes supports OAuth authentication through:

- Google
- GitHub

Authentication is required for contributor functionality, while public notes can be discovered without requiring an account.

---

# 🔐 Security Principles

OpenNotes follows several important security principles.

### Server-side validation

Client-side validation improves UX but is never trusted as a security boundary.

Data is validated again on the server.

### Authorization

Administrative actions verify the authenticated user's role on the server.

Client-side UI restrictions are not treated as authorization.

### File validation

Uploaded files are validated for:

- File type
- File size
- File name
- File content where applicable

Storage keys are generated independently from user-provided filenames.

### Secrets

Storage credentials, authentication secrets, and other private configuration values must never be exposed to the browser.

### Database

PDF binary data is not stored directly inside PostgreSQL.

---

# ♿ Accessibility

OpenNotes aims to provide an accessible experience across:

- Desktop
- Mobile
- Tablet
- School computers
- Smartboards

The UI uses:

- Semantic HTML
- Keyboard navigation
- Accessible labels
- Visible focus states
- Accessible dialogs
- Appropriate ARIA attributes
- Touch-friendly controls

---

# 🌱 Development

## Requirements

Before running OpenNotes locally, make sure you have:

- Node.js
- npm, pnpm, or another supported package manager
- PostgreSQL
- OAuth credentials for Google/GitHub
- Object storage credentials for file uploads

---

# ⚙️ Installation

Clone the repository:

```bash
git clone <repository-url>
cd opennotes
```

Install dependencies:

```bash
npm install
```

Or:

```bash
pnpm install
```

---

# 👤 Contributor Experience

Contributors are more than uploaders.

OpenNotes recognizes people who contribute useful educational material to the community.

Contributor pages can display:

- Name
- Username
- Avatar
- Biography
- Published notes
- Downloads
- Contribution activity
- Contribution ranking

The platform should emphasize contribution quality and usefulness rather than encouraging users to upload large numbers of low-quality files.

---

# 🏆 Contributor Rankings

Contributor rankings can combine useful metrics such as:

- Published notes
- Downloads
- Other platform-defined contribution signals

A ranking system should reward meaningful contributions rather than raw upload volume.

Top contributors may receive recognition such as:

```text
🥇 Gold
🥈 Silver
🥉 Bronze
```

Recognition should be designed to respect contributors and encourage healthy participation.

---

# 📈 Contribution Activity

Contributor activity can be represented as a GitHub-style contribution graph.

Each day contains:

```text
date
count
level
```

For example:

```text
0 contributions → level 0
1 contribution  → level 1
2–3             → level 2
4–6             → level 3
7+              → level 4
```

This makes contributor activity easy to understand visually.

---

## License

The OpenNotes application source code is licensed under the MIT License.

Copyright © 2026 OpenNotes Contributors

See the [LICENSE](./LICENSE) file for the complete license text.

---

# 🤝 Contributing to OpenNotes

Contributions to the OpenNotes codebase are welcome.

Before submitting a pull request:

1. Create a branch.
2. Make your changes.
3. Run linting and type checks.
4. Test the affected functionality.
5. Keep the changes focused.
6. Explain important architectural decisions in the pull request.

For larger changes, open an issue or discussion first.

---

# 💡 Philosophy

OpenNotes is built around a simple idea:

> Useful knowledge should be easy to discover and easy to share.

A student should be able to find the material they need.

A teacher should be able to share a resource with an entire classroom.

A contributor should be recognized for helping others.

And the platform should make all three experiences simple.

---

## OpenNotes

**Find notes. Share knowledge. Learn together.**
