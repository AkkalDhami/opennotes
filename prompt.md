# Build a Production-Ready Public Student Notes Platform

## 1. Project Overview

Build a modern, production-ready web application where students, teachers, and other contributors can publicly share and discover educational notes, primarily in PDF format.

The core problem being solved is:

> Teachers often share PDF notes through private WhatsApp groups or other restricted channels. Students may not be able to log into WhatsApp on school smartboards, may not have access to the private group, or may need to transfer files through USB drives. This platform provides a public, organized, searchable place where educational notes can be uploaded once and accessed by anyone.

The platform should function like a **public community-driven library of academic notes**.

Users should be able to:

- Search for notes
- Browse notes by academic category
- View PDFs online
- Download PDFs
- Share notes publicly
- Create contributor profiles
- Discover other contributors
- See popular and recent notes
- Share notes through short URLs
- Generate QR codes for notes

The platform must prioritize **simplicity, discoverability, accessibility, performance, and trust**.

---

# 2. Core Product Philosophy

The application is NOT just a file upload website.

The product should feel like:

> A public academic library where students and teachers contribute knowledge for everyone.

The primary product loop is:

```text
Student/Teacher needs notes
        ↓
Search / Browse
        ↓
Find useful note
        ↓
View / Download
        ↓
Discover "Share Your Notes"
        ↓
Upload notes
        ↓
More students benefit
        ↓
More contributors join
```

Optimize the entire application around this loop.

---

# 3. Technology Stack

Use the following technologies.

## Frontend

- Next.js
- TypeScript
- React
- App Router
- Tailwind CSS
- shadcn/ui
- base-ui (not radix-ui)
- Huge icons or tabler icons
- Nuqs for search url
- zod
- Tanstack-Query
- motion/react for animation

## Backend

Use Next.js server-side functionality wherever practical:

- Server Components
- Server Actions
- Route Handlers
- API endpoints only when necessary

## Database

Use:

- PostgreSQL
- Drizzle ORM & Neon
- Redis

Keep the schema relational, normalized, and scalable.

## Authentication

Use a modern authentication solution compatible with Next.js.

Support:

- OAuth(Google & GitHub)
- Session

Authentication must NOT be required for browsing, viewing, or downloading public notes.

Authentication is required for:

- Uploading notes
- Managing uploaded notes
- Creating/editing contributor profiles
- Bookmarking notes
- Reporting content if desired

## File Storage

Do NOT store PDF binary data directly inside PostgreSQL.

Use object storage such as:

- imagekit(recommended) or cloudinary

Design the storage layer so the provider can be changed later.

## Validation

Use:

- Zod
- Server-side validation
- Client-side validation where useful

## Forms

Use:

- React Hook Form
- Zod

## PDF

Support:

- Browser PDF preview
- PDF metadata
- Page count where practical
- Download
- Secure file delivery

## QR Code

Use a QR code library to generate QR codes for public note URLs.

---

# 4. Important Development Rules

Follow these rules throughout the project.

### TypeScript

Use strict TypeScript.

Avoid:

```ts
any
```

unless absolutely unavoidable.

Prefer explicit types and reusable domain types.

### Components

Build reusable components.

Do not create massive components containing the entire page.

Prefer:

```text
components/
  notes/
  contributors/
  upload/
  search/
  layout/
  ui/
```

### Server vs Client Components

Use Server Components by default.

Only use `"use client"` when client-side interactivity is actually required.

### Security

Never trust client-provided data.

Validate everything on the server.

Never expose private storage credentials.

Never allow arbitrary file paths from the client.

### UX

Every asynchronous action needs:

- Loading state
- Success state
- Error state

Use skeletons for page loading where appropriate.

Use toast(react-hot-toast) notifications for transient actions.

Add the blue color in themes in tailwindcss
like:
- --color-brand-500: var(--color-blue-500)
- --color-brand-200: var(--color-blue-200)
- --color-brand-400: var(--color-blue-400)
- --color-brand-300: var(--color-blue-300)
- --color-brand-100: var(--color-blue-100)
- ....

Make the minimal simple ui
---

# 5. Branding

Create a simple, memorable brand identity.

The product should feel:

- Educational
- Open
- Community-driven
- Trustworthy
- Modern
- Minimal
- Fast

Do not make the design feel like a generic corporate SaaS dashboard.

Use generous whitespace and excellent typography.

The UI should be inspired by modern documentation platforms, knowledge repositories, and educational products.

---

# 6. Responsive Design

The application must work extremely well on:

- Mobile
- Tablet
- Desktop
- Large desktop displays

Mobile-first design is preferred.

The website should be usable on school computers and smartboards.

Avoid tiny text and unnecessarily dense controls.

---

# 7. Main Navigation

Desktop navigation:

```text
Logo

Notes
Subjects
Contributors

Search

+ Share Notes

[User avatar / Login]
```

Mobile navigation:

```text
Logo
Search
Menu
```

The "Share Notes" action should remain highly visible.

---

# 8. Homepage

Create a clean, high-conversion homepage.

The hero section should communicate the purpose immediately.

Suggested copy:

```text
Study together. Share knowledge.

Find and share notes, study materials, and educational resources
with students everywhere.

[ Search notes, subjects, topics... ]

[ Browse Notes ]    [ Share Your Notes ]
```

Do not overpopulate the hero section.

Below the hero, include:

## Popular Notes

Show cards for popular notes.

Each card should include:

- Title
- Subject
- Class/grade
- Contributor
- Page count
- Download count
- Tags

## Recently Added

Show recently published notes.

## Browse by Subject

Display popular subjects.

Examples:

- Mathematics
- Physics
- Chemistry
- Biology
- Computer Science
- English
- Economics
- Accounting
- Engineering

## Top Contributors

Show contributor cards with:

- Avatar
- Name
- Short bio
- Number of notes
- Number of downloads

Include:

```text
View all contributors →
```

## Call to Action

End the homepage with:

```text
Have useful notes?

Share them with students everywhere.

[ Share Your Notes ]
```

---

# 9. Notes Discovery

Create `/notes`.

This page should be the main note discovery interface.

Include:

- Search
- Filters
- Sorting
- Pagination/infinite loading

Filters:

- Education level
- Class/grade
- Subject
- Topic
- Institution
- Academic year
- Contributor
- Tags

Sorting:

- Most downloaded
- Most viewed
- Newest
- Oldest
- Most relevant

The URL should preserve search/filter state where practical.

Example:

```text
/notes?subject=physics&grade=12
```

---

# 10. Search

Create a powerful search experience.

Search should search:

- Note title
- Description
- Subject
- Topic
- Tags
- Contributor name
- Institution

Example:

```text
class 12 physics ray optics
```

should return relevant notes.

Start with PostgreSQL full-text/trigram search if appropriate.

Design the search abstraction so it can later be replaced with:

- Meilisearch
- Typesense
- Algolia
- Elasticsearch/OpenSearch

Do not tightly couple the application to one search engine.

---

# 11. Note Card

Create a reusable `NoteCard`.

Example:

```text
┌─────────────────────────────────────┐
│ PDF                                 │
│                                     │
│ Electromagnetic Induction           │
│                                     │
│ Physics · Class 12                  │
│                                     │
│ 24 pages · 1.2K downloads           │
│                                     │
│ By Anish K.                         │
│                                     │
│ #physics #electromagnetism          │
└─────────────────────────────────────┘
```

Cards should be clickable.

Use semantic HTML.

---

# 12. Individual Note Page

Create:

```text
/notes/[slug]
```

The note page should contain:

## Header

```text
Physics
Class 12
Electromagnetism

Electromagnetic Induction

Shared by Anish K.
```

Show:

- Views
- Downloads
- Page count
- File size
- Published date

Actions:

```text
[ View PDF ]
[ Download ]
[ Share ]
[ Generate QR ]
[ Save ]
```

## PDF Viewer

Display the PDF directly in the browser when supported.

On mobile, provide an appropriate viewer/download experience.

Do not require users to install additional software.

## Description

Show the contributor-provided description.

## Tags

Show relevant tags.

## Contributor

Display contributor profile preview.

## Related Notes

Show related notes based on:

- Subject
- Grade
- Topic
- Tags

---

# 13. Short URLs

Every public note should have a stable URL.

Example:

```text
example.com/notes/electromagnetic-induction-class-12
```

Optionally support a short URL:

```text
example.com/n/abc123
```

The short URL should redirect to the canonical note page.

This is useful for teachers sharing notes in classrooms.

---

# 14. QR Code Feature

Every public note should have a "Generate QR" action.

The QR code should encode the public note URL.

Display:

```text
Share this note

[ QR CODE ]

Anyone who scans this code can open the note.

[ Download QR ]
```

Teachers should be able to display this QR code on:

- Smartboards
- Projectors
- Presentations
- Classroom screens

This feature directly addresses the original problem.

---

# 15. Upload System

Create:

```text
/upload
```

The upload interface must be extremely simple.

Primary upload area:

```text
┌───────────────────────────────────┐
│                                   │
│       Drop your PDF here          │
│                                   │
│       or Browse files             │
│                                   │
│       PDF up to X MB              │
│                                   │
└───────────────────────────────────┘
```

Only allow approved file types.

Initially support:

```text
application/pdf
```

Validate:

- MIME type
- Extension
- File size
- File signature/magic bytes where practical

Never rely solely on the file extension.

---

# 16. Upload Metadata

After selecting a PDF, show a metadata form.

Fields:

### Title

Required.

### Description

Optional.

### Education Level

Examples:

- School
- College
- University
- Other

### Grade / Class

Examples:

- Grade 8
- Grade 9
- Grade 10
- Grade 11
- Grade 12
- Bachelor's
- Master's

Allow flexible values because education systems vary by country.

### Subject

Required.

### Topic

Optional.

### Institution

Optional.

### Academic Year

Optional.

### Tags

Optional.

### Contributor attribution

Automatically associate the upload with the authenticated user.

---

# 17. Upload Preview

Before publishing:

```text
Your note

Electromagnetic Induction

Physics · Class 12

24 pages · 2.4 MB

Uploaded by you

[ Edit ]

[ Publish Notes ]
```

After successful publishing:

```text
Your note has been published.

[ View Note ]

[ Share ]

[ Upload Another ]
```

---

# 18. Contributor Profiles

Create:

```text
/contributors
/contributors/[username]
```

Contributor listing should show:

- Avatar
- Name
- Bio
- Number of notes
- Total downloads
- Verification status if applicable

Profile page:

```text
Anish K.

Student & Contributor

127 Notes
18,420 Downloads

About

...

Notes

[Search/filter contributor's notes]

...
```

Contributors should have public profile URLs.

---

# 19. Contributor Leaderboard

Create a "Top Contributors" section.

Rank users by useful metrics.

Examples:

```text
🥇 Contributor A — 127 notes
🥈 Contributor B — 98 notes
🥉 Contributor C — 81 notes
```

Avoid encouraging spam uploads.

Do not rank purely by number of uploaded files.

Consider a score based on:

- Useful notes
- Downloads
- Views
- Approved uploads
- Reports
- Account age

The ranking algorithm should be configurable.

---

# 20. Contributor Badges

Create a flexible badge system.

Examples:

```text
Contributor
Active Contributor
Top Contributor
Verified Contributor
Teacher
Community Helper
```

Store badges relationally rather than hardcoding them into UI components.

---

# 21. User Dashboard

Create:

```text
/dashboard
```

Dashboard sections:

```text
Overview
My Notes
Upload
Profile
Bookmarks
Settings
```

Overview:

```text
Your Contributions

12 Notes
4,820 Downloads
7,200 Views
```

My Notes table:

```text
Title
Subject
Status
Views
Downloads
Created
Actions
```

Actions:

- View
- Edit
- Delete
- Unpublish if supported

---

# 22. Authentication

Unauthenticated users can:

- Browse
- Search
- View notes
- Download public notes

Authenticated users can:

- Upload
- Edit their own notes
- Manage profile
- Bookmark
- Report
- Track their contributions

Admin users can:

- Moderate
- Delete
- Review reports
- Manage users
- Manage subjects
- Manage categories

---

# 23. Database Schema

Create a scalable Drizzle schema.

Core models should include:

```text
User
Profile
Note
Subject
Category
Tag
NoteTag
Download
View
Bookmark
Report
Badge
UserBadge
Institution
```

Suggested relationships:

```text
User
 ├── Profile
 ├── Notes
 ├── Bookmarks
 ├── Reports
 └── Badges

Note
 ├── User/Contributor
 ├── Subject
 ├── Category
 ├── Tags
 ├── Views
 ├── Downloads
 ├── Bookmarks
 └── Reports
```

Use proper indexes.

Important indexes should include:

- Note slug
- Note status
- Note createdAt
- Note subjectId
- Note categoryId
- Note contributorId
- Search fields
- User username
- User email
- Tag slug

---

# 24. Note Status

Notes should have a moderation state.

For example:

```text
DRAFT
PENDING_REVIEW
PUBLISHED
REJECTED
REMOVED
```

For the MVP, automatically publish trusted/simple uploads if desired, but keep the moderation architecture ready.

Administrators should be able to change status.

---

# 25. Moderation

Because anyone can upload public content, moderation is mandatory.

Create:

```text
/admin
/admin/notes
/admin/reports
/admin/users
/admin/subjects
```

Admin dashboard should show:

```text
Total Users
Total Notes
Pending Notes
Total Downloads
Total Views
Open Reports
```

---

# 26. Reporting

Every note should have:

```text
Report this note
```

Possible reasons:

- Copyright infringement
- Spam
- Incorrect content
- Offensive content
- Malware/suspicious file
- Duplicate
- Other

Allow an optional explanation.

Store reports in the database.

Admins can:

- Review
- Dismiss
- Remove note
- Contact contributor if supported

---

# 27. Copyright and Content Rights

The platform must NOT imply that all uploaded material is automatically free of copyright restrictions.

During upload, include a concise confirmation such as:

```text
I confirm that I have the right to share this material publicly, or that
the material is appropriately licensed for public sharing.
```

Require acceptance before publishing.

Include:

- Terms of service
- Privacy policy
- Copyright/takedown process
- Content reporting

Do not build a system that intentionally facilitates unauthorized redistribution of copyrighted textbooks or paid course materials.

---

# 28. Duplicate Detection

Prevent unnecessary duplicate uploads.

Initially calculate a file hash such as SHA-256.

If the same file already exists:

```text
This file appears to have already been uploaded.

[ View Existing Note ]
```

Later consider:

- PDF text similarity
- Title similarity
- Content similarity

---

# 29. File Storage Architecture

Create a storage abstraction.

For example:

```ts
interface FileStorage {
  upload(...)
  delete(...)
  getUrl(...)
}
```

Implement the first provider using S3-compatible storage.

Do not expose secret credentials to the browser.

Use signed URLs or another secure mechanism where appropriate.

For genuinely public files, public CDN URLs may be acceptable, but design the abstraction so access policy can change later.

---

# 30. Download Tracking

When users download a note:

- Increment download count
- Optionally record a download event
- Do not require login

Avoid double-counting obvious repeated requests from the same session/IP within a short configurable period.

Do not collect unnecessary personal information.

---

# 31. View Tracking

Track note views.

Do not blindly increment the counter on every client-side render.

Implement a reasonable deduplication strategy.

Keep privacy in mind.

---

# 32. SEO

SEO is extremely important because students will discover notes through search engines.

Every public note should have:

- Unique title
- Meta description
- Canonical URL
- Open Graph metadata
- Twitter/X card metadata
- Structured data where appropriate

Generate sitemap pages for:

- Notes
- Subjects
- Contributors

Use semantic URLs.

Example:

```text
/notes/physics/electromagnetic-induction-class-12
```

or another consistent structure.

Avoid duplicate URLs indexing the same content.

---

# 33. Structured Data

For public note pages, use appropriate JSON-LD where useful.

Consider:

- CreativeWork
- LearningResource
- Person
- BreadcrumbList

Do not fabricate information.

---

# 34. Accessibility

Follow WCAG principles.

Requirements:

- Keyboard navigable
- Proper labels
- Semantic HTML
- Focus states
- Sufficient contrast
- Screen-reader friendly
- Accessible dialogs
- Accessible dropdowns
- Accessible forms

Do not rely on color alone to communicate state.

---

# 35. Error Handling

Create polished error states.

Examples:

### No search results

```text
No notes found.

Try another subject, topic, or search term.

[ Browse all notes ]
```

### Note not found

```text
This note could not be found.

It may have been removed or the URL may be incorrect.

[ Browse Notes ]
```

### Upload failure

```text
We couldn't upload your file.

Please check the file and try again.
```

Never expose internal errors, stack traces, database details, or credentials.

---

# 36. Empty States

Every dashboard and list should have a useful empty state.

Example:

```text
You haven't shared any notes yet.

Help other students by sharing your first note.

[ Share Notes ]
```

---

# 37. Loading States

Use:

- Skeleton cards
- Skeleton tables
- Button loading indicators
- Upload progress
- PDF loading states

Avoid blank screens.

---

# 38. Notifications

Use toast notifications for actions such as:

```text
Note uploaded successfully.
Note deleted.
Profile updated.
Bookmark added.
Report submitted.
```

Keep notifications concise.

---

# 39. Theme

Support:

- Light mode
- Dark mode

Persist the user's preference.

The default should follow system preference.

---

# 40. Design System

Use shadcn/ui consistently.

Create reusable components for:

- NoteCard
- ContributorCard
- SearchBar
- FilterPanel
- UploadDropzone
- PDFViewer
- StatCard
- Badge
- EmptyState
- LoadingState
- ShareDialog
- QRDialog
- ConfirmDialog

Avoid inconsistent one-off UI.

Use kebab-case like `components/shared/theme-toggle.tsx`

---

# 41. Folder Structure

Use a clean structure similar to:

```text
src/
  app/
    page.tsx

    notes/
      page.tsx
      [slug]/
        page.tsx

    subjects/
      page.tsx
      [slug]/
        page.tsx

    contributors/
      page.tsx
      [username]/
        page.tsx

    upload/
      page.tsx

    dashboard/
      page.tsx
      notes/
        page.tsx
      profile/
        page.tsx
      settings/
        page.tsx

    admin/
      page.tsx
      notes/
        page.tsx
      reports/
        page.tsx
      users/
        page.tsx

  components/
    notes/
    contributors/
    upload/
    search/
    pdf/
    dashboard/
    admin/
    layout/
    ui/

  lib/
    auth/
    db/
    storage/
    search/
    validation/
    analytics/
    utils/

  actions/
    notes.ts
    upload.ts
    profile.ts
    bookmarks.ts
    reports.ts

  types/
```

Adapt this structure if the framework version recommends a better organization.

---

# 42. API / Server Actions

Prefer Server Actions for mutations where appropriate.

Examples:

```text
createNote
updateNote
deleteNote
publishNote
uploadFile
createBookmark
removeBookmark
reportNote
updateProfile
```

Validate authorization inside every mutation.

Never assume that because a button is hidden, the action is protected.

---

# 43. Authorization

Implement authorization centrally.

Example roles:

```text
USER
MODERATOR
ADMIN
```

Users can only modify their own notes.

Moderators/admins can moderate notes.

Admins can manage users and platform configuration.

Every server-side authorization check must verify the authenticated user.

---

# 44. Rate Limiting

Protect public endpoints and expensive operations.

Rate-limit:

- Login
- Upload
- Search if necessary
- Report
- Download tracking
- View tracking
- API endpoints

Use a Redis-compatible solution if required.

Keep rate limits configurable.

---

# 45. Upload Security

Do not blindly trust uploaded PDFs.

At minimum:

- Restrict MIME type
- Restrict file size
- Verify PDF signature
- Generate a safe storage key
- Never use the raw filename as the storage path
- Sanitize displayed filenames
- Scan uploaded files if infrastructure permits
- Do not execute uploaded content

Never allow an uploaded file to become executable server-side content.

---

# 46. PDF Processing

When a PDF is uploaded, attempt to extract:

- Page count
- File size
- Title metadata where available
- Text metadata where appropriate

Do not block the upload if optional metadata extraction fails.

Store processing status if processing is asynchronous.

Possible future model:

```text
PROCESSING
READY
FAILED
```

---

# 47. Analytics

Build privacy-conscious analytics.

Track platform-level metrics:

- Notes published
- Downloads
- Views
- Contributors
- Popular subjects

Do not unnecessarily collect personally identifiable information.

Create a simple admin analytics dashboard.

---

# 48. Performance

The platform should be fast.

Use:

- Next.js Server Components
- Image optimization
- Lazy loading
- Pagination
- Database indexes
- CDN/object storage
- Caching where appropriate

Do not load thousands of notes on one page.

Use pagination or infinite loading.

---

# 49. Caching

Cache public content where appropriate.

Good candidates:

- Popular notes
- Subject lists
- Contributor lists
- Public note metadata

Invalidate caches when notes are published, updated, or removed.

---

# 50. SEO-Friendly URL Strategy

Prefer human-readable URLs.

Examples:

```text
/notes/physics/electromagnetic-induction-class-12
/subjects/physics
/contributors/anish-k
```

Avoid exposing database IDs in canonical URLs where possible.

Use slugs.

**Ensure slugs are unique.**

---

# 51. Search Engine Indexing Rules

Index:

- Public published notes
- Public subjects
- Public contributor profiles

Do not index:

- Dashboard
- Admin pages
- Draft notes
- Private content
- Login pages
- Internal API routes

---

# 52. Internationalization Consideration

The initial UI can be English.

However, design the database and UI so the platform can later support:

- Nepali
- Other languages

Do not hardcode user-facing text throughout complex business logic.

**FOR NOW ENGLISH ONLY.**

---

# 53. Seed Data

Create realistic seed data for development.

Include:

- Several users
- Contributors
- Subjects
- Categories
- Tags
- Notes
- Views/download counts
- Badges

Use fictional data.

Do not use copyrighted educational PDFs in seed data.

Use placeholder/mock PDF metadata or developer-provided sample files.

---

# 54. Admin Demo Account

For development only, provide a clear mechanism for creating an admin account.

Do not hardcode production passwords.

Use environment variables or a setup command.

---

# 55. Environment Variables

Create:

```text
DATABASE_URL=
AUTH_SECRET=

STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

NEXT_PUBLIC_APP_URL=
```

Document all environment variables in:

```text
.env.example
```

Never commit secrets.

---

# 56. README

Create a comprehensive README containing:

## Project overview

## Features

## Tech stack

## Requirements

## Installation

## Environment variables

## Database setup

## Drizzle migrations

## Seed data

## Development

## Production build

## Storage setup

## Authentication setup

## Deployment

## Security considerations

## Future roadmap

---

# 57. Testing

Add meaningful tests.

At minimum test:

### Unit tests

- Validation
- Slug generation
- Permission checks
- Search helpers
- Download deduplication
- Badge calculations

### Integration tests

- Upload flow
- Note creation
- Note publishing
- Bookmarking
- Reporting

### E2E tests

Test critical flows:

```text
Anonymous user:
Search → Open note → Download

Authenticated user:
Login → Upload PDF → Publish → View note

Admin:
Login → Review report → Remove note
```

---

# 58. Important Product Constraints

Do NOT:

- Require login to browse notes
- Require login to download public notes
- Build a social media-style feed as the main experience
- Overcomplicate the upload process
- Store PDF binaries in PostgreSQL
- Trust client-side authorization
- expose storage credentials
- make contributors compete purely on upload volume
- encourage copyright infringement
- allow unrestricted arbitrary file uploads
- sacrifice performance for unnecessary animations

---

# 59. Future Features

Design the architecture so these can be added later:

## Collections

Users can create:

```text
My Physics Notes
Exam Preparation
Semester 1
```

## Bookmarks

Students can save useful notes.

## Comments

Allow discussion under notes with moderation.

## Institution pages

Example:

```text
Tribhuvan University
 ├── BCA
 ├── BBS
 └── BSc
```

## Teacher profiles

Verified teacher accounts.

## Verified notes

Notes reviewed by trusted contributors.

## Full-text document search

Search inside PDF content.

## AI-assisted organization

Automatically suggest:

- Subject
- Topic
- Tags
- Description

Do not make AI a requirement for the core product.

## Recommendations

Recommend:

```text
Students who viewed this note also viewed...
```

---

# 60. Smartboard/Teacher Experience

Treat this as a dedicated use case.

A teacher should be able to:

1. Open the website on a smartboard.
2. Search for a note.
3. Open the note.
4. Display the QR code.
5. Students scan it using their phones.
6. Students open/download the note.

Alternatively:

```text
example.com/n/physics12
```

can be written on the board.

This should require no student login.

---

# 61. Homepage Example Information Architecture

The final homepage should roughly follow:

```text
NAVBAR
────────────────────────────────────────

LOGO

Notes     Subjects     Contributors

[ Search ]

[ Share Notes ]

────────────────────────────────────────

HERO

Study together.
Share knowledge.

Find and share notes with students everywhere.

[ Search notes... ]

[ Browse Notes ] [ Share Notes ]

────────────────────────────────────────

POPULAR NOTES

[ Note ] [ Note ] [ Note ]

View all →

────────────────────────────────────────

BROWSE BY SUBJECT

Mathematics
Physics
Chemistry
Biology
Computer Science
English
...

────────────────────────────────────────

RECENTLY ADDED

[ Note ]
[ Note ]
[ Note ]

────────────────────────────────────────

TOP CONTRIBUTORS

[ Contributor ]
[ Contributor ]
[ Contributor ]

View all →

────────────────────────────────────────

CALL TO ACTION

Have useful notes?

Share them with students everywhere.

[ Share Your Notes ]

────────────────────────────────────────

FOOTER
```

---

# 62. Visual Design Requirements

Use a modern academic aesthetic.

Characteristics:

- Clean
- Minimal
- Professional
- Friendly
- Spacious
- Strong typography
- Subtle borders
- Moderate rounded corners
- Restrained shadows
- Clear hierarchy

Avoid:

- Excessive gradients
- Excessive glassmorphism
- Huge decorative animations
- Overly colorful dashboards
- Excessive icons
- Marketing-heavy SaaS visuals

The content should remain the focus.

---

# 63. Accessibility on Smartboards

Make interactive elements large enough for touch interaction.

Buttons should have comfortable hit areas.

Avoid hover-only functionality.

Important actions should work with:

- Touch
- Mouse
- Keyboard

---

# 64. Empty / New Platform Experience

The platform may initially have few notes.

Design the empty state intentionally.

Instead of:

```text
No notes found.
```

use:

```text
This library is just getting started.

Be one of the first people to share useful notes.

[ Share Your Notes ]
```

But don't make the interface feel empty or unfinished.

---

# 65. Implementation Strategy

Build the application incrementally.

Do NOT attempt to implement every future feature immediately.

Implement in this order:

### Phase 1

- Project setup
- Design system
- Database
- Authentication
- Layout
- Homepage

### Phase 2

- Notes
- Subjects
- Search
- Note detail
- PDF viewing
- Downloads

### Phase 3

- Upload
- Storage
- Contributor profiles
- Dashboard

### Phase 4

- Moderation
- Reports
- Admin dashboard

### Phase 5

- QR codes
- SEO
- Analytics
- Performance improvements

Only after the MVP works should advanced functionality be introduced.

---

# 66. Definition of Done

The MVP is complete when:

1. A visitor can open the homepage.
2. A visitor can search notes without logging in.
3. A visitor can filter notes.
4. A visitor can open a public note.
5. A visitor can view the PDF.
6. A visitor can download the PDF.
7. A user can create an account.
8. A user can upload a PDF.
9. A user can provide metadata.
10. The PDF is stored securely.
11. The note becomes publicly accessible after publishing.
12. The contributor profile is automatically associated with the note.
13. Contributors have public profile pages.
14. Download and view counts work.
15. A public note has a shareable URL.
16. A QR code can be generated.
17. Users can report inappropriate/problematic notes.
18. Admins can review reports.
19. Admins can remove notes.
20. The site works well on mobile, desktop, and smartboards.
21. Public note pages are SEO-friendly.
22. The application handles errors gracefully.
23. No secrets are exposed to the client.
24. Server-side authorization is enforced.
25. The project can be deployed using documented instructions.

---

# 67. Development Approach

Before writing a large amount of code:

1. Inspect the existing project structure.
2. Determine the installed Next.js version.
3. Determine whether shadcn/ui is already configured.
4. Determine whether Drizzle/Neon/PostgreSQL is already configured.
5. Preserve existing working configuration unless there is a strong reason to change it.
6. Identify missing dependencies.
7. Create a concise implementation plan.
8. Implement the database schema.
9. Build the application incrementally.
10. Run type checking.
11. Run linting.
12. Run tests.
13. Fix errors.
14. Verify responsive layouts.
15. Verify authentication and authorization.
16. Verify upload security.
17. Verify public note access.
18. Verify admin moderation.

Do not rewrite the entire project unnecessarily.

---

# 68. Code Quality

Write production-quality code.

Prefer:

- Small reusable functions
- Clear naming
- Strong typing
- Server-side validation
- Explicit authorization
- Separation of concerns
- Reusable UI components
- Clear error handling

Avoid:

- Giant components
- Duplicated logic
- Hardcoded business rules
- Client-only security
- `any`
- Unnecessary abstractions
- Premature microservices

---

# 69. Final Goal

The final application should feel like a real product, not a coding demo.

A student should be able to visit the website and immediately understand:

> "I can find my notes here."

A teacher should understand:

> "I can share this PDF here and my students can access it without WhatsApp or a USB drive."

A contributor should feel:

> "My notes are helping other students."

The core experience must remain:

```text
FIND NOTES
     ↓
VIEW
     ↓
DOWNLOAD
     ↓
SHARE
     ↓
CONTRIBUTE
```

Build the application around that experience.

Do not add complexity unless it improves one of those core actions.