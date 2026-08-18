import { APP_NAME, SITE_URL } from "@/constants/app.constants"
import type { Metadata } from "next"

export const DEFAULT_DESCRIPTION =
  "Find, read, download, and share educational notes, study materials, and learning resources with students everywhere."

export const DEFAULT_KEYWORDS = [
  "educational notes",
  "study notes",
  "student notes",
  "PDF notes",
  "study materials",
  "class notes",
  "lecture notes",
  "academic notes",
]

export function absoluteUrl(path = "") {
  return new URL(path, SITE_URL).toString()
}

export function createMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  image = "/og-image.png",
  noIndex = false,
}: {
  title: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}): Metadata {
  const url = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)

  return {
    title,
    description,

    keywords: DEFAULT_KEYWORDS,

    alternates: {
      canonical: url,
    },

    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },

    openGraph: {
      type: "website",
      siteName: APP_NAME,
      title,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}
