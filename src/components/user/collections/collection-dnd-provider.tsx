"use client"

import { useState, type ReactNode } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"

/**
 * Hosts the single react-dnd manager for a collections view.
 *
 * The backend is snapshotted once at mount rather than tracked with
 * `useMediaQuery`: react-dnd sets up global event listeners when a backend
 * mounts, so letting the pointer type flip mid-session (plugging in a mouse,
 * rotating a hybrid device) would tear down and re-register the manager
 * underneath in-flight drags. A stale-but-stable backend is the safer trade,
 * and `enableMouseEvents` means the touch backend still works with a mouse if
 * we guess wrong.
 *
 * The initializer reads `window` directly so the very first client render
 * already has the right backend — the provider emits no DOM of its own, so
 * this cannot cause a hydration mismatch.
 */
export function CollectionDndProvider({ children }: { children: ReactNode }) {
  const [isCoarsePointer] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches
  )

  if (isCoarsePointer) {
    return (
      <DndProvider
        backend={TouchBackend}
        options={{
          enableMouseEvents: true,
          // Long-press to start a drag, so vertical scrolling still works.
          delayTouchStart: 160,
          ignoreContextMenu: true,
        }}
      >
        {children}
      </DndProvider>
    )
  }

  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>
}
