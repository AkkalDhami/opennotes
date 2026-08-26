/**
 * Client-safe helpers for searching and reshaping a collection tree.
 *
 * Everything here is generic over the node shape so the same helpers work for
 * full {@link CollectionTreeNode}s (which carry every db column) and for the
 * lightweight `{id, name}` option trees the parent pickers render.
 */

/** The minimum a node needs for name/description search. */
export type SearchableTreeNode = {
  id: string
  name: string
  description?: string | null
  children: SearchableTreeNode[]
}

export function filterCollectionTree<T extends SearchableTreeNode>(
  nodes: T[],
  query: string
): { tree: T[]; expandIds: Set<string> } {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return { tree: nodes, expandIds: new Set() }

  const expandIds = new Set<string>()

  function matches(node: T) {
    const haystack = `${node.name} ${node.description ?? ""}`.toLowerCase()
    return haystack.includes(trimmed)
  }

  function walk(list: T[]): T[] {
    const result: T[] = []

    for (const node of list) {
      const children = walk(node.children as T[])
      const selfMatches = matches(node)

      if (selfMatches || children.length > 0) {
        if (children.length > 0) expandIds.add(node.id)
        // Cast: spreading a T and swapping in a narrowed `children` array is
        // still a T at runtime, but TS can't prove that for a generic.
        result.push({ ...node, children } as T)
      }
    }

    return result
  }

  return { tree: walk(nodes), expandIds }
}

type FlattenableTreeNode = {
  id: string
  name: string
  children: FlattenableTreeNode[]
}

/** Flattens a tree into a depth-labelled list, for the parent-collection select. */
export function flattenCollectionTree<T extends FlattenableTreeNode>(
  nodes: T[],
  depth = 0
): { id: string; name: string; depth: number }[] {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, depth },
    ...flattenCollectionTree(node.children as T[], depth + 1),
  ])
}

type IdentifiableTreeNode = { id: string; children: IdentifiableTreeNode[] }

/** Walks the tree to find a node's ancestor chain (nearest-first excluded, root-first). */
export function collectAncestorIds<T extends IdentifiableTreeNode>(
  tree: T[],
  targetId: string
): string[] {
  const path: string[] = []

  function walk(nodes: T[], trail: string[]): boolean {
    for (const node of nodes) {
      if (node.id === targetId) {
        path.push(...trail)
        return true
      }
      if (walk(node.children as T[], [...trail, node.id])) return true
    }
    return false
  }

  walk(tree, [])
  return path
}

/** Depth-first lookup by id — used to resolve a selected id back to its name. */
export function findTreeNode<T extends IdentifiableTreeNode>(
  nodes: T[],
  targetId: string
): T | null {
  for (const node of nodes) {
    if (node.id === targetId) return node
    const found = findTreeNode(node.children as T[], targetId)
    if (found) return found
  }
  return null
}
