"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { useAppearanceStore } from "@/hooks/use-appearance-store"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()
  const setMode = useAppearanceStore((s) => s.setMode)
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      if (!document.startViewTransition) {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
        setMode(resolvedTheme === "dark" ? "light" : "dark")

        return
      }

      document.startViewTransition(() =>
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      )
      event.preventDefault()
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setMode, setTheme])

  return null
}

export { ThemeProvider }
