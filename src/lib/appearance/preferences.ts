import type { ThemeName } from "./themes"

export type AppearanceMode = "light" | "dark" | "system"

export type FontFamily =
  | "geist"
  | "inter"
  | "manrope"
  | "dm-sans"
  | "source-sans"
  | "roboto"
  | "open-sans"
  | "plus-jakarta-sans"
  | "space-grotesk"
  | "sora"
  | "figtree"
  | "outfit"
  | "public-sans"
  | "bricolage-grotesque"
  | "montserrat"
  | "lora"
  | "merriweather"
  | "playfair-display"
  | "source-serif-pro"
  | "fraunces"
  | "geist-mono"
  | "jetbrains-mono"
  | "fira-code"
  | "roboto-mono"
  | "source-code-pro"
  | "space-mono"
  | "ibm-plex-mono"
  | "serif"
  | "mono"
  | "instrument-sans"
  | "instrument-serif"

export type FontSize = "small" | "medium" | "large"

export type Radius = "none" | "compact" | "default" | "rounded"

export type Density = "compact" | "comfortable" | "spacious"

export interface AppearancePreferences {
  mode: AppearanceMode
  theme: ThemeName
  fontFamily: FontFamily
  fontSize: FontSize
  radius: Radius
  density: Density
  reduceMotion: boolean
}

export const DEFAULT_PREFERENCES: AppearancePreferences = {
  mode: "system",
  theme: "carbon",
  fontFamily: "manrope",
  fontSize: "medium",
  radius: "default",
  density: "comfortable",
  reduceMotion: false,
}

export const RADIUS_REM: Record<Radius, number> = {
  none: 0,
  compact: 0.375,
  default: 0.5,
  rounded: 0.75,
}

export const FONT_SIZE_PX: Record<FontSize, number> = {
  small: 14,
  medium: 16,
  large: 18,
}

export const FONT_LABELS: Record<FontFamily, string> = {
  geist: "Geist",
  inter: "Inter",
  manrope: "Manrope",
  "instrument-sans": "Instrument Sans",
  "instrument-serif": "Instrument Serif",
  "dm-sans": "DM Sans",
  "source-sans": "Source Sans 3",
  roboto: "Roboto",
  sora: "Sora",
  montserrat: "Montserrat",
  "open-sans": "Open Sans",
  "plus-jakarta-sans": "Plus Jakarta Sans",
  "space-grotesk": "Space Grotesk",
  figtree: "Figtree",
  outfit: "Outfit",
  "public-sans": "Public Sans",
  "bricolage-grotesque": "Bricolage Grotesque",
  lora: "Lora",
  merriweather: "Merriweather",
  "playfair-display": "Playfair Display",
  "source-serif-pro": "Source Serif Pro",
  fraunces: "Fraunces",
  "geist-mono": "Geist Mono",
  "jetbrains-mono": "JetBrains Mono",
  "fira-code": "Fira Code",
  "roboto-mono": "Roboto Mono",
  "source-code-pro": "Source Code Pro",
  "space-mono": "Space Mono",
  "ibm-plex-mono": "IBM Plex Mono",
  serif: "Serif",
  mono: "Monospace",
}

export type FontCategory = "sans" | "serif" | "mono"

export const CATEGORY_LABELS: Record<FontCategory, string> = {
  sans: "Sans Serif",
  serif: "Serif",
  mono: "Monospace",
}

export const FONT_CATEGORIES: Record<FontCategory, FontFamily[]> = {
  sans: [
    "geist",
    "inter",
    "manrope",
    // "dm-sans",
    // "source-sans",
    // "roboto",
    // "open-sans",
    "plus-jakarta-sans",
    "space-grotesk",
    "sora",
    "figtree",
    // "outfit",
    // "public-sans",
    "bricolage-grotesque",
    "montserrat",
    "instrument-sans",
  ],
  serif: [
    // "serif",
    "lora",
    "merriweather",
    "instrument-serif",
    "playfair-display",
    "source-serif-pro",
    "fraunces",
  ],
  mono: [
    "mono",
    "geist-mono",
    "jetbrains-mono",
    "fira-code",
    "roboto-mono",
    "source-code-pro",
    "space-mono",
    "ibm-plex-mono",
  ],
}

export interface DensityTokens {
  cardPadding: string // Tailwind padding class for card-like containers
  listGap: string // Tailwind gap class for stacked lists
  rowPadding: string // Tailwind vertical padding class for table/list rows
  sectionGap: string // Tailwind gap class between major settings sections
}

export const DENSITY_TOKENS: Record<Density, DensityTokens> = {
  compact: {
    cardPadding: "p-3",
    listGap: "gap-2",
    rowPadding: "py-1.5",
    sectionGap: "gap-6",
  },
  comfortable: {
    cardPadding: "p-4",
    listGap: "gap-3",
    rowPadding: "py-2.5",
    sectionGap: "gap-8",
  },
  spacious: {
    cardPadding: "p-6",
    listGap: "gap-4",
    rowPadding: "py-3.5",
    sectionGap: "gap-10",
  },
}

export const DISPLAY_MODE_OPTIONS: {
  value: AppearanceMode
  label: string
  description: string
}[] = [
  {
    value: "light",
    label: "Light",
    description: "Use a light color scheme",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Use a dark color scheme",
  },
  {
    value: "system",
    label: "Use device setting",
    description: "Match your system preference",
  },
]

export const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
]

export const RADIUS_OPTIONS: { value: Radius; label: string }[] = [
  { value: "none", label: "Sharp" },
  { value: "compact", label: "Compact" },
  { value: "default", label: "Default" },
  { value: "rounded", label: "Rounded" },
]

export const DENSITY_OPTIONS: { value: Density; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
]
