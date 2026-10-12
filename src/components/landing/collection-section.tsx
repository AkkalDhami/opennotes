"use client"

import { Reveal } from "@/components/shared/reveal"
import { SectionHeader } from "@/components/shared/section-header"
import { Section } from "@/components/ui/section"
import {
  CollectionCard,
  CollectionCardData,
} from "../collections/collection-card"

type CollectionSectionProps = {
  collections: CollectionCardData[]
}

export function CollectionSection({ collections }: CollectionSectionProps) {
  return (
    <Section id="collections-section" aria-labelledby="collections-heading">
      <Reveal>
        <SectionHeader
          headingId="collections-heading"
          title="Study Collections"
          description="Find organized study materials shared by the community."
          viewAllHref="/collections"
          viewAllLabel="View all collections"
        />
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Reveal key={collection.slug}>
            <CollectionCard c={collection} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
