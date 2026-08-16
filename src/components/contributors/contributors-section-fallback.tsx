import { ContributorCardSkeleton } from "@/components/contributors/contributor-card-skeleton"
import { Heading } from "../ui/heading"
import { SubHeading } from "../ui/sub-heading"

export function ContributorsSectionFallback() {
  return (
    <div>
      <div className="space-y-2">
        <Heading id="top-contributors-heading">
          Meet Our Top Contributors
        </Heading>
        <SubHeading>
          Recognizing members who&lsquo;ve shared the most notes with everyone.
        </SubHeading>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ContributorCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
