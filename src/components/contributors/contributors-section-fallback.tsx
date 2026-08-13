import { ContributorCardSkeleton } from "@/components/contributors/contributor-card-skeleton";

export function ContributorsSectionFallback() {
  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wide text-primary">
            THE COMMUNITY
          </p>
          <h2
            id="contributors-heading"
            className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Meet the contributors
          </h2>
          <p className="max-w-md text-muted-foreground">
            Students and teachers sharing knowledge to help others learn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ContributorCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
