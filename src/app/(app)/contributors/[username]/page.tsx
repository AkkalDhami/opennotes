import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContributorProfile } from "@/components/contributors/contributor-profile"
import { APP_NAME } from "@/constants/app.constants"
import {
  getContributorPageData,
  getPublicContributorByUsername,
} from "@/lib/contributors/queries"
import { absoluteUrl } from "@/lib/seo"
import type { NoteSort } from "@/types/contributor"

interface ContributorPageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{
    page?: string | string[]
    sort?: string | string[]
  }>
}

type SearchParam = string | string[] | undefined

const VALID_SORTS: readonly NoteSort[] = [
  "newest",
  "oldest",
  "most_downloaded",
  "most_viewed",
]

function getSearchParamValue(value: SearchParam): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function parseSort(value: SearchParam): NoteSort {
  const sort = getSearchParamValue(value)
  return VALID_SORTS.find((option) => option === sort) ?? "newest"
}

function parsePage(value: SearchParam): number {
  const parsed = Number(getSearchParamValue(value))
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1
}

// --- SEO (spec section 31) ---------------------------------------------

export async function generateMetadata({
  params,
}: ContributorPageProps): Promise<Metadata> {
  const { username } = await params

  const contributor = await getPublicContributorByUsername(username)

  if (!contributor) {
    return {
      title: "Contributor Not Found",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = `${contributor.name} (@${contributor.username}) — ${APP_NAME} Contributor`

  const description =
    contributor.bio ||
    `${contributor.name} has shared educational notes and study materials with the ${APP_NAME} learning community.`

  return {
    title,
    description,

    alternates: {
      canonical: absoluteUrl(`/contributors/${contributor.username}`),
    },

    openGraph: {
      type: "profile",
      title,
      description,
      url: absoluteUrl(`/contributors/${contributor.username}`),
      images: [absoluteUrl(contributor.avatarUrl || "/og-image.png")],
    },
  }
}

// TODO: emit Person + BreadcrumbList JSON-LD structured data (spec
// section 31) — likely via a small <script type="application/ld+json">
// rendered from this page using only real, non-fabricated fields.

export default async function ContributorPage({
  params,
  searchParams,
}: ContributorPageProps) {
  const [{ username }, query] = await Promise.all([params, searchParams])
  const contributor = await getPublicContributorByUsername(username)

  if (!contributor) {
    notFound()
  }

  const page = parsePage(query.page)
  const sort = parseSort(query.sort)
  const data = await getContributorPageData(contributor, { page, sort })

  return <ContributorProfile {...data} currentPage={page} currentSort={sort} />
}
