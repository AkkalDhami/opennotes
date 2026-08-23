"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon } from "@hugeicons/core-free-icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { LogoutIntent } from "@/types/session"
import {
  logoutAllSessions,
  logoutCurrentSession,
  logoutOtherSessions,
  logoutSession,
} from "@/lib/auth/session-actions"
import { Spinner } from "@/components/ui/spinner"

const COPY: Record<
  LogoutIntent["kind"],
  {
    title: string
    description: (intent: LogoutIntent) => string
    confirmLabel: string
    pendingLabel: string
  }
> = {
  session: {
    title: "Log out this device?",
    description: (intent) => {
      const label =
        intent.kind === "session" ? intent.deviceLabel : "this device"
      return `This will sign out ${label} from your OpenNotes account. The device will need to sign in again to access your account.`
    },
    confirmLabel: "Log out",
    pendingLabel: "Logging out…",
  },
  current: {
    title: "Log out of this device?",
    description: () => "You will be signed out of OpenNotes on this device.",
    confirmLabel: "Log out",
    pendingLabel: "Logging out…",
  },
  others: {
    title: "Log out other devices?",
    description: () =>
      "This will sign out your OpenNotes account from all other devices. Your current device will remain signed in.",
    confirmLabel: "Log out other devices",
    pendingLabel: "Logging out devices…",
  },
  all: {
    title: "Log out all devices?",
    description: () =>
      "This will sign you out of OpenNotes everywhere, including this device. You will need to sign in again.",
    confirmLabel: "Log out all devices",
    pendingLabel: "Logging out…",
  },
}

async function runAction(intent: LogoutIntent) {
  switch (intent.kind) {
    case "session":
      return logoutSession(intent.sessionId)
    case "current":
      return logoutCurrentSession()
    case "others":
      return logoutOtherSessions()
    case "all":
      return logoutAllSessions()
  }
}

export function LogoutAlertDialog({
  intent,
  open,
  onOpenChange,
  onSuccess,
}: {
  intent: LogoutIntent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (intent: LogoutIntent) => void
}) {
  const [isPending, startPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset transient state whenever a new intent is armed.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setError(null)
  }, [open])

  if (!intent) return null

  const copy = COPY[intent.kind]

  async function handleConfirm() {
    if (!intent || isPending) return // guards against double submission
    startPending(true)
    setError(null)

    const result = await runAction(intent)

    startPending(false)

    if (result.success) {
      onOpenChange(false)
      onSuccess(intent)
    } else {
      setError(result.message)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return // don't allow closing mid-request
        onOpenChange(next)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {copy.description(intent)}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <HugeiconsIcon
              icon={Alert02Icon}
              size={18}
              strokeWidth={2}
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? (
              <>
                <Spinner /> {copy.pendingLabel}
              </>
            ) : (
              copy.confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
