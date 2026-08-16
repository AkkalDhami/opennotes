"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"; // ASSUMPTION: existing OpenNotes component
import { buildNoteFiltersQuery } from "@/lib/notes/note-filters";
import type { NoteFilterState } from "@/types/note";

interface NoteGridPaginationProps {
  page: number;
  totalPages: number;
  filters: NoteFilterState;
}

export function NoteGridPagination({
  page,
  totalPages,
  filters,
}: NoteGridPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    return `${pathname}${buildNoteFiltersQuery(filters, { page: targetPage })}`;
  }

  function goTo(targetPage: number) {
    if (targetPage < 1 || targetPage > totalPages) return;
    router.push(hrefFor(targetPage), { scroll: true });
  }

  const pageNumbers = getPageWindow(page, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={hrefFor(page - 1)}
            onClick={(e) => {
              e.preventDefault();
              goTo(page - 1);
            }}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pageNumbers.map((entry, i) =>
          entry === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href={hrefFor(entry)}
                isActive={entry === page}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(entry);
                }}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href={hrefFor(page + 1)}
            onClick={(e) => {
              e.preventDefault();
              goTo(page + 1);
            }}
            aria-disabled={page >= totalPages}
            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function getPageWindow(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  const window = 1;
  const pages = new Set<number>([1, total]);
  for (let i = current - window; i <= current + window; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(sorted[i]);
  }
  return result;
}
