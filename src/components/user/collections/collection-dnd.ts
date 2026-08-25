/**
 * Shared drag-and-drop vocabulary for collection reordering.
 *
 * Deliberately free of `react-dnd` imports so the presentational components
 * (`CollectionRow`, `CollectionCard`) can accept drag connectors without
 * pulling the library into their type surface.
 */

/** The payload carried while a collection is in flight. */
export interface CollectionDragItem {
  id: string
  /** Live index inside the sibling group — mutated as rows swap under the cursor. */
  index: number
}

/**
 * A drag type scoped to one sibling group, which is what keeps re-ordering and
 * re-parenting separate concerns: a row can only be dropped among the siblings
 * it started with. Moving a collection somewhere else is "Move to…" in the
 * actions menu, where the destination can be validated against cycles.
 *
 * `scope` additionally separates the list and grid views so their targets can
 * never see each other's items.
 */
export function collectionDragType(
  scope: "row" | "card",
  parentId: string | null
) {
  return `collection/${scope}/${parentId ?? "root"}`
}

/**
 * Loose ref-callback shape matching react-dnd's connectors without importing
 * them. React 19 rejects ref callbacks that return a value, so call sites wrap
 * the connector in a block body: `ref={(node) => { connector(node) }}`.
 */
export type DragConnectorRef = (element: HTMLElement | null) => void
