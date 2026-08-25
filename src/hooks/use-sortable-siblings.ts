"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import { reorderCollections } from "@/lib/user/collections"

interface SortableNode {
  id: string
}

/**
 * Optimistic ordering for one sibling group.
 *
 * Drag-and-drop needs two different things from the same list: an order that
 * updates on every hover (so the dragged row visibly follows the cursor) and an
 * order that is written once, on drop. The hover order lives in local state;
 * `commit` persists it with `reorderCollections`.
 *
 * The live order is mirrored into a ref so `commit` can stay referentially
 * stable — otherwise every hover would produce a new `commit`, re-registering
 * the react-dnd connectors mid-drag.
 *
 * On failure the previous order is restored, so a rejected write never leaves
 * the UI claiming an order the database doesn't have.
 */
export function useSortableSiblings<T extends SortableNode>(
  nodes: T[],
  parentId: string | null
) {
  const router = useRouter()
  const [order, setOrder] = useState<T[]>(nodes)
  const [isSaving, setIsSaving] = useState(false)

  const orderRef = useRef<T[]>(nodes)
  const nodesRef = useRef<T[]>(nodes)
  // eslint-disable-next-line react-hooks/refs
  nodesRef.current = nodes

  // The server is the source of truth between drags: a refresh, rename,
  // duplicate or "Move to…" all arrive as a new `nodes` prop, and any local
  // order left over from a previous drag is stale by then.
  const nodeKey = nodes.map((node) => node.id).join(",")
  const committedKeyRef = useRef(nodeKey)

  useEffect(() => {
    orderRef.current = nodesRef.current
    committedKeyRef.current = nodeKey
    setOrder(nodesRef.current)
    // `nodeKey` stands in for the identity of `nodes`; depending on the array
    // itself would resync on every render.
  }, [nodeKey])

  const applyOrder = useCallback((next: T[]) => {
    orderRef.current = next
    setOrder(next)
  }, [])

  /** Hover handler — reorders locally, touching nothing on the server. */
  const move = useCallback(
    (fromIndex: number, toIndex: number) => {
      const current = orderRef.current
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= current.length ||
        toIndex >= current.length
      ) {
        return
      }

      const next = [...current]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      applyOrder(next)
    },
    [applyOrder]
  )

  /** Drop handler — persists whatever order the hovers landed on. */
  const commit = useCallback(async () => {
    const orderedIds = orderRef.current.map((node) => node.id)
    const key = orderedIds.join(",")
    if (orderedIds.length === 0 || key === committedKeyRef.current) return

    const previousKey = committedKeyRef.current
    committedKeyRef.current = key
    setIsSaving(true)

    const result = await reorderCollections({ parentId, orderedIds })
    setIsSaving(false)

    if (!result.ok) {
      committedKeyRef.current = previousKey
      applyOrder(nodesRef.current)
      toast.error(result.error)
      return
    }

    router.refresh()
  }, [applyOrder, parentId, router])

  return { order, move, commit, isSaving }
}
