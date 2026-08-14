import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Route } from "next";

interface UsersPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  /** Current query params (already includes page), used to build page links. */
  searchParams?: Record<string, string | undefined>;
}

function buildHref(
  page: number,
  searchParams: Record<string, string | undefined> = {}
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

export function UsersPagination({
  page,
  totalPages,
  total,
  limit,
  searchParams = {},
}: UsersPaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  // Show a small, centered window of page numbers around the current page.
  const windowSize = 5;
  let windowStart = Math.max(1, page - Math.floor(windowSize / 2));
  const windowEnd = Math.min(totalPages, windowStart + windowSize - 1);
  windowStart = Math.max(1, windowEnd - windowSize + 1);
  const pageNumbers = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, index) => windowStart + index
  );

  const linkBase =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const disabledClasses = "pointer-events-none opacity-50";

  return (
    <nav
      aria-label="Users pagination"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {total} users
      </p>

      <div className="flex items-center gap-1">
        <Link
          href={buildHref(page - 1, searchParams) as Route}
          aria-disabled={!hasPrevious}
          aria-label="Previous page"
          tabIndex={hasPrevious ? undefined : -1}
          className={cn(
            linkBase,
            "border border-border hover:bg-accent hover:text-accent-foreground",
            !hasPrevious && disabledClasses
          )}
        >
          <HugeiconsIcon
            icon={ArrowLeft02Icon}
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {windowStart > 1 ? (
            <span className="px-2 text-sm text-muted-foreground">…</span>
          ) : null}
          {pageNumbers.map((pageNumber) => (
            <Link
              key={pageNumber}
              href={buildHref(pageNumber, searchParams) as Route}
              aria-current={pageNumber === page ? "page" : undefined}
              className={cn(
                linkBase,
                pageNumber === page
                  ? buttonVariants({ variant: "default", size: "sm" })
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {pageNumber}
            </Link>
          ))}
          {windowEnd < totalPages ? (
            <span className="px-2 text-sm text-muted-foreground">…</span>
          ) : null}
        </div>

        <Link
          href={buildHref(page + 1, searchParams) as Route}
          aria-disabled={!hasNext}
          aria-label="Next page"
          tabIndex={hasNext ? undefined : -1}
          className={cn(
            linkBase,
            "border border-border hover:bg-accent hover:text-accent-foreground",
            !hasNext && disabledClasses
          )}
        >
          <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Link>
      </div>
    </nav>
  );
}
