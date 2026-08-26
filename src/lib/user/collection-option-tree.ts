/**
 * Builds nestable trees out of the flat collection lists that dialogs receive.
 *
 * The picker components render a tree, but the two call sites hand us different
 * shapes: `getOwnerCollectionOptions` returns `{id, name, parentId}` rows, while
 * `CreateCollectionInlineForm` receives an already-flattened `{id, name, depth}`
 * list. This module normalizes both into {@link CollectionOptionNode}.
 *
 * Deliberately free of server-only imports — the pickers are client components.
 */

export type CollectionOptionNode = {
  id: string
  name: string
  children: CollectionOptionNode[]
}

/** Sorts each sibling group by name so the picker order is predictable. */
function sortByName(nodes: CollectionOptionNode[]): CollectionOptionNode[] {
  nodes.sort((a, b) => a.name.localeCompare(b.name))
  for (const node of nodes) sortByName(node.children)
  return nodes
}

/**
 * `{id, name, parentId}[]` -> tree. A row whose `parentId` points at something
 * not present in the list is surfaced at the top level rather than dropped:
 * `collections.parent_id` has no foreign key, so a dangling pointer is possible
 * and silently hiding the collection would be worse than showing it flat.
 */
export function buildOptionTree(
  options: { id: string; name: string; parentId: string | null }[]
): CollectionOptionNode[] {
  const byId = new Map<string, CollectionOptionNode>(
    options.map((option) => [
      option.id,
      { id: option.id, name: option.name, children: [] },
    ])
  )

  const roots: CollectionOptionNode[] = []

  for (const option of options) {
    const node = byId.get(option.id)!
    const parent = option.parentId ? byId.get(option.parentId) : undefined

    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  return sortByName(roots)
}

/**
 * `{id, name, depth}[]` -> tree, using a stack of the current ancestor chain.
 * Assumes the list is in depth-first order, which is what
 * {@link flattenCollectionTree} produces.
 */
export function buildTreeFromDepthList(
  options: { id: string; name: string; depth: number }[]
): CollectionOptionNode[] {
  const roots: CollectionOptionNode[] = []
  const stack: CollectionOptionNode[] = []

  for (const option of options) {
    const node: CollectionOptionNode = {
      id: option.id,
      name: option.name,
      children: [],
    }

    // Unwind to the level that should own this node. `depth` is clamped by the
    // stack length so a malformed jump (0 -> 2) attaches to the nearest real
    // ancestor instead of being lost.
    const depth = Math.min(option.depth, stack.length)
    stack.length = depth

    const parent = stack[depth - 1]
    if (parent) parent.children.push(node)
    else roots.push(node)

    stack.push(node)
  }

  return roots
}
