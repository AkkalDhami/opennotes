import type {
  NoteSuggestion,
  SearchNotesParams,
  SearchNotesResult,
} from "./search-types"

export interface NotesSearchIndex {
  search(params: SearchNotesParams): Promise<SearchNotesResult>
  suggest(query: string): Promise<NoteSuggestion[]>
}

let activeIndex: NotesSearchIndex | null = null

async function getActiveIndex(): Promise<NotesSearchIndex> {
  if (!activeIndex) {
    const { PostgresNotesSearchIndex } = await import("./postgres-notes-search")
    activeIndex = new PostgresNotesSearchIndex()
  }
  return activeIndex
}

export async function searchNotes(
  params: SearchNotesParams
): Promise<SearchNotesResult> {
  const index = await getActiveIndex()
  return index.search(params)
}

export async function suggestNotes(query: string): Promise<NoteSuggestion[]> {
  const index = await getActiveIndex()
  return index.suggest(query)
}
