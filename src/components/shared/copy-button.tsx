"use client"

import type { ComponentProps } from "react"

import type { CopyState } from "@/hooks/use-copy-to-clipboard"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CancelCircleIcon,
  CheckIcon,
  Copy01Icon,
} from "@hugeicons/core-free-icons"

export function CopyStateIcon({ state }: { state: CopyState }) {
  return state === "idle" ? (
    <HugeiconsIcon
      key={"idle"}
      icon={Copy01Icon}
      size={16}
      color="currentColor"
      strokeWidth={2}
      className={cn(
        "transition-all",
        "scale-100 opacity-100",
        "stroke-muted-foreground group-hover/icon:stroke-primary"
      )}
    />
  ) : state === "done" ? (
    <HugeiconsIcon
      key="done"
      icon={CheckIcon}
      size={16}
      color="currentColor"
      strokeWidth={2}
      className={cn(
        "stroke-primary transition-all group-hover:text-brand",
        "scale-100 opacity-100",
        "stroke-brand group-hover/icon:stroke-brand"
      )}
    />
  ) : state === "error" ? (
    <HugeiconsIcon
      key="error"
      icon={CancelCircleIcon}
      size={16}
      color="currentColor"
      strokeWidth={2}
      className={cn(
        "stroke-current text-red-500 transition-all",
        "scale-100 opacity-100"
      )}
    />
  ) : null
}

export type CopyButtonProps = ComponentProps<"button"> & {
  text: string | (() => string)
  onCopySuccess?: (text: string) => void
  onCopyError?: (error: Error) => void
  children?: React.ReactNode
}

export function CopyButton({
  children,
  text,
  onCopySuccess,
  onCopyError,
  onClick,
  className,
  ...props
}: CopyButtonProps) {
  const { state, copy } = useCopyToClipboard({
    onCopySuccess,
    onCopyError,
  })

  return (
    <button
      onClick={(e) => {
        copy(text)
        onClick?.(e)
      }}
      disabled={state === "done"}
      className={cn(
        "group/icon absolute right-0 bottom-0 flex cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 disabled:pointer-events-none disabled:cursor-not-allowed",
        "hover:bg-muted",
        "duration-100 ease-in-out",
        "px-2 py-2",
        className
      )}
      aria-label="Copy"
      {...props}
    >
      <CopyStateIcon state={state} />
      {children}
    </button>
  )
}
