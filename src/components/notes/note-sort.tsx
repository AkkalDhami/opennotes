"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildNoteFiltersQuery,
  parseNoteFilters,
  resolveDefaultSort,
} from "@/lib/notes/note-filters";
import { NOTE_SORT_OPTIONS, type NoteSortOption } from "@/types/note";

export function NoteSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = parseNoteFilters(Object.fromEntries(searchParams.entries()));
  const activeSort = resolveDefaultSort(filters);

  function handleChange(next: string) {
    const query = buildNoteFiltersQuery(filters, {
      sort: next as NoteSortOption,
      page: undefined,
    });
    router.push(`${pathname}${query}`, { scroll: false });
  }

  return (
    <Select value={activeSort} onValueChange={handleChange}>
      <SelectTrigger aria-label="Sort notes" className="w-full sm:w-52">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {NOTE_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
