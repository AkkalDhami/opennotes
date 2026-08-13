import { SectionHeader } from "@/components/shared/section-header"
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal"
import { SubjectCard } from "@/components/subjects/subject-card"
import { SubjectCardSkeleton } from "@/components/subjects/subject-card-skeleton"
import { Section } from "@/components/ui/section"
import { popularSubjects } from "@/data/subjects"

export function PopularSubjects({}) {
  const isLoading = false

  return (
    <Section aria-labelledby="popular-subjects-heading">
      <Reveal>
        <SectionHeader
          headingId="popular-subjects-heading"
          title="Popular subjects"
          description="Explore notes by what you're studying."
          viewAllHref="/subjects"
          viewAllLabel="View all subjects"
        />
      </Reveal>

      <StaggerGroup className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <SubjectCardSkeleton key={i} />
            ))
          : popularSubjects.map((subject) => (
              <StaggerItem key={subject.id}>
                <SubjectCard subject={subject} />
              </StaggerItem>
            ))}
      </StaggerGroup>
    </Section>
  )
}
