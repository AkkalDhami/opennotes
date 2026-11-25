"use client"

import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal"
import { SectionHeader } from "@/components/shared/section-header"
import { Section } from "@/components/ui/section"
import {
  CollectionCard,
  type CollectionCardData,
  type CollectionView,
} from "@/components/collections/collection-card"

type CollectionSectionProps = {
  collections: CollectionCardData[]
  view?: CollectionView
}

export function CollectionSection({
  collections,
  view = "grid",
}: CollectionSectionProps) {
  return (
    <Section id="collections-section" aria-labelledby="collections-heading">
      <Reveal>
        <SectionHeader
          headingId="collections-heading"
          title="Study Collections"
          highlight="Collections"
          description="Find organized study materials shared by the community."
          viewAllHref="/collections"
          viewAllLabel="View all collections"
        />
      </Reveal>

      <StaggerGroup
        className={
          view === "list"
            ? "mt-8 border-b"
            : "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {collections.map((collection, index) => (
          <StaggerItem key={collection.slug} className="h-full">
            <CollectionCard
              c={collection}
              index={index}
              view={view}
              reveal={false}
            />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Section>
  )
}
