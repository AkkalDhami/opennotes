import { APP_NAME } from "@/constants/app.constants"
import { absoluteUrl } from "@/lib/seo"

interface NoteJsonLdProps {
  note: {
    title: string
    description: string | null
    slug: string
    subject: string
    grade: string
    publishedAt: Date | null
    contributor: {
      name: string
      username: string
    }
  }
}

export function NoteJsonLd({ note }: NoteJsonLdProps) {
  const url = absoluteUrl(`/notes/${note.slug}`)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",

    name: note.title,

    description:
      note.description ||
      `${note.title} educational notes for ${note.subject} ${note.grade}.`,

    url,

    learningResourceType: "Notes",

    educationalUse: ["Study", "Revision"],

    about: {
      "@type": "Thing",
      name: note.subject,
    },

    educationalLevel: note.grade,

    author: {
      "@type": "Person",
      name: note.contributor.name,
      url: absoluteUrl(`/contributors/${note.contributor.username}`),
    },

    datePublished: note.publishedAt?.toISOString(),

    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      url: absoluteUrl(),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  )
}
