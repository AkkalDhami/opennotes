import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  AppearanceMode,
  AppearancePreferences,
  Density,
  DEFAULT_PREFERENCES,
  FontFamily,
  FontSize,
  Radius,
} from "@/lib/appearance/preferences"
import { ThemeName } from "@/lib/appearance/themes"

interface AppearanceStore extends AppearancePreferences {
  setMode: (mode: AppearanceMode) => void
  setTheme: (theme: ThemeName) => void
  setFontFamily: (fontFamily: FontFamily) => void
  setFontSize: (fontSize: FontSize) => void
  setRadius: (radius: Radius) => void
  setDensity: (density: Density) => void
  setReduceMotion: (reduceMotion: boolean) => void
  reset: () => void
}

export const useAppearanceStore = create<AppearanceStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setMode: (mode) => set({ mode }),
      setTheme: (theme) => set({ theme }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize }),
      setRadius: (radius) => set({ radius }),
      setDensity: (density) => set({ density }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      reset: () => set({ ...DEFAULT_PREFERENCES }),
    }),
    {
      name: "opennotes-preferences",
    }
  )
)

export const useAppearanceMode = () => useAppearanceStore((s) => s.mode)
export const useAppearanceTheme = () => useAppearanceStore((s) => s.theme)
export const useAppearanceFontFamily = () =>
  useAppearanceStore((s) => s.fontFamily)
export const useAppearanceFontSize = () => useAppearanceStore((s) => s.fontSize)
export const useAppearanceRadius = () => useAppearanceStore((s) => s.radius)
export const useAppearanceDensity = () => useAppearanceStore((s) => s.density)
export const useAppearanceReduceMotion = () =>
  useAppearanceStore((s) => s.reduceMotion)
