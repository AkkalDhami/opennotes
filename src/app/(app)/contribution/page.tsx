import { ContributionForm } from "@/components/contributions/contribution-form"
import { ContributionGuidelines } from "@/components/contributions/contribution-guidelines"
import { Reveal } from "@/components/shared/reveal"
import { SectionHeader } from "@/components/shared/section-header"
import { Container } from "@/components/ui/container"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

export default function page() {
  return (
    <Container className="space-y-6 border-x px-4 pt-4 pb-6">
      <div className="space-y-2">
        <Reveal>
          <SectionHeader
            headingId="share-notes"
            title="Share your notes"
            description="Help other students learn by sharing your study materials. Upload your
          notes and contribute to the community."
            viewAllHref="#"
          />
        </Reveal>
      </div>
      <ContributionGuidelines />
      <div className="mt-y flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href="https://www.ilovepdf.com/compress_pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4"
        >
          Compress PDF
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={14}
            color="currentColor"
            strokeWidth={2}
          />
        </Link>

        <Link
          href="https://www.google.com/search?q=compress+pdf+online"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Find other PDF compressors
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={14}
            color="currentColor"
            strokeWidth={2}
          />
        </Link>
      </div>

      <ContributionForm />
    </Container>
  )
}
