"use client"

import { useEffect } from "react"
import { RADIUS_REM } from "@/lib/appearance/preferences"
import { FONT_FAMILY_STACKS, FONT_SIZE_VALUES } from "@/lib/appearance/fonts"
import { useAppearanceStore } from "@/hooks/use-appearance-store"

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const mode = useAppearanceStore((s) => s.mode)
  const theme = useAppearanceStore((s) => s.theme)
  const radius = useAppearanceStore((s) => s.radius)
  const fontFamily = useAppearanceStore((s) => s.fontFamily)
  const reduceMotion = useAppearanceStore((s) => s.reduceMotion)
  const fontSize = useAppearanceStore((s) => s.fontSize)

  // Color mode
  useEffect(() => {
    const root = document.documentElement
    const mql = window.matchMedia("(prefers-color-scheme: dark)")

    const applyMode = () => {
      const effective =
        mode === "system" ? (mql.matches ? "dark" : "light") : mode

      root.setAttribute("data-mode", effective)
      root.classList.toggle("dark", effective === "dark")
    }

    applyMode()

    if (mode === "system") {
      mql.addEventListener("change", applyMode)

      return () => {
        mql.removeEventListener("change", applyMode)
      }
    }
  }, [mode])

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  // Radius
  useEffect(() => {
    const rem = RADIUS_REM[radius]

    document.documentElement.style.setProperty("--radius", `${rem}rem`)
  }, [radius])

  // Font family
  useEffect(() => {
    const fontStack = FONT_FAMILY_STACKS[fontFamily]

    if (!fontStack) return

    document.documentElement.style.setProperty("--font-sans", fontStack)
  }, [fontFamily])

  // Font size
  useEffect(() => {
    const value = FONT_SIZE_VALUES[fontSize]

    if (!value) return

    document.documentElement.style.fontSize = value
  }, [fontSize])

  // Reduced motion
  useEffect(() => {
    const root = document.documentElement
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")

    const apply = () => {
      const effective = reduceMotion || mql.matches

      root.setAttribute("data-reduce-motion", String(effective))
    }

    apply()

    mql.addEventListener("change", apply)

    return () => {
      mql.removeEventListener("change", apply)
    }
  }, [reduceMotion])

  return <>{children}</>
}
