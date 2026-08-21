"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowReloadHorizontalIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { Dialog } from "@base-ui/react"
import { useAppearanceStore } from "@/hooks/use-appearance-store"

export function ResetPreferencesDialog() {
  const reset = useAppearanceStore((s) => s.reset)

  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-border px-3.5 py-2 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <HugeiconsIcon icon={ArrowReloadHorizontalIcon} size={14} />
            Reset preferences
          </button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-popover p-5 text-popover-foreground shadow-lg">
          <div className="mb-2 flex items-start justify-between">
            <Dialog.Title className="text-base font-semibold">
              Reset preferences?
            </Dialog.Title>
            <Dialog.Close
              render={
                <button
                  aria-label="Close"
                  className="rounded-sm p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={16} />
                </button>
              }
            />
          </div>
          <Dialog.Description className="mb-5 text-sm text-muted-foreground">
            This restores the default theme, typography, and layout settings.
            This can&apos;t be undone.
          </Dialog.Description>
          <div className="flex justify-end gap-2">
            <Dialog.Close
              render={
                <button className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground">
                  Cancel
                </button>
              }
            />
            <Dialog.Close
              render={
                <button
                  onClick={reset}
                  className="text-destructive-foreground rounded-md bg-destructive px-3 py-1.5 text-sm font-medium"
                >
                  Reset
                </button>
              }
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
