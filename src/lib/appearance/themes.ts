export type ThemeName =
  | "carbon"
  | "midnight"
  | "ember"
  | "teal"
  | "ocean-blue"
  | "midnight-azure"
  | "graphite-studio"
  | "forest-grove"
  | "emerald-study"
  | "royal-violet"
  | "rosewood"
  | "warm-sand"
  | "paper-cream"
  | "slate"
  | "nordic"
  | "deep-purple"
  | "volt"
  | "cosmic-navy"

export interface ThemeSeed {
  id: ThemeName
  name: string
  description: string
  neutralHue: number
  neutralSat: number
  primaryHue: number
  primarySat: number
  accentHue: number
  accentSat: number
}

export interface ThemeTokens {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
  sidebar: string
  sidebarForeground: string
  sidebarPrimary: string
  sidebarPrimaryForeground: string
  sidebarAccent: string
  sidebarBorder: string
  sidebarRing: string
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
}

export interface ThemeDefinition extends ThemeSeed {
  light: ThemeTokens
  dark: ThemeTokens
}

/** Minimal metadata used by theme cards — kept separate from full token objects (spec #19). */
export interface ThemePreviewMeta {
  id: ThemeName
  name: string
  description: string
  preview: {
    background: string
    foreground: string
    primary: string
    card: string
  }
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, "0")
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

export const THEME_SEEDS: ThemeSeed[] = [
  {
    id: "carbon",
    name: "Carbon",
    description: "Minimal & monochrome",
    neutralHue: 0,
    neutralSat: 0,
    primaryHue: 0,
    primarySat: 0,
    accentHue: 0,
    accentSat: 0,
  },
  {
    id: "cosmic-navy",
    name: "Cosmic Navy",
    description: "Deep navy & electric blue",
    neutralHue: 225,
    neutralSat: 18,
    primaryHue: 222,
    primarySat: 75,
    accentHue: 215,
    accentSat: 55,
  },
  {
    id: "volt",
    name: "Volt",
    description: "Bold & energetic",
    neutralHue: 80,
    neutralSat: 0,
    primaryHue: 90,
    primarySat: 100,
    accentHue: 80,
    accentSat: 100,
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Midnight & dark",
    neutralHue: 0,
    neutralSat: 0,
    primaryHue: 0,
    primarySat: 0,
    accentHue: 80,
    accentSat: 100,
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    description: "Clear & confident",
    neutralHue: 212,
    neutralSat: 14,
    primaryHue: 210,
    primarySat: 75,
    accentHue: 198,
    accentSat: 60,
  },
  {
    id: "deep-purple",
    name: "Deep Purple",
    description: "Vibrant & elegant",
    neutralHue: 270,
    neutralSat: 10,
    primaryHue: 270,
    primarySat: 50,
    accentHue: 280,
    accentSat: 40,
  },
  {
    id: "ember",
    name: "Ember",
    description: "Charcoal & warm orange",
    neutralHue: 30,
    neutralSat: 8,
    primaryHue: 28,
    primarySat: 85,
    accentHue: 32,
    accentSat: 55,
  },
  {
    id: "teal",
    name: "Teal Study",
    description: "Cool & serene",
    neutralHue: 180,
    neutralSat: 10,
    primaryHue: 180,
    primarySat: 45,
    accentHue: 200,
    accentSat: 40,
  },

  {
    id: "midnight-azure",
    name: "Midnight Azure",
    description: "Deep blue & luminous",
    neutralHue: 222,
    neutralSat: 18,
    primaryHue: 224,
    primarySat: 80,
    accentHue: 210,
    accentSat: 65,
  },

  {
    id: "graphite-studio",
    name: "Graphite Studio",
    description: "Graphite & violet",
    neutralHue: 255,
    neutralSat: 6,
    primaryHue: 262,
    primarySat: 50,
    accentHue: 270,
    accentSat: 40,
  },
  {
    id: "forest-grove",
    name: "Forest Grove",
    description: "Calm & grounded",
    neutralHue: 140,
    neutralSat: 8,
    primaryHue: 142,
    primarySat: 40,
    accentHue: 95,
    accentSat: 35,
  },
  {
    id: "emerald-study",
    name: "Emerald Study",
    description: "Focused & fresh",
    neutralHue: 170,
    neutralSat: 10,
    primaryHue: 162,
    primarySat: 55,
    accentHue: 180,
    accentSat: 45,
  },

  {
    id: "royal-violet",
    name: "Royal Violet",
    description: "Bold & scholarly",
    neutralHue: 268,
    neutralSat: 10,
    primaryHue: 270,
    primarySat: 55,
    accentHue: 290,
    accentSat: 40,
  },
  {
    id: "rosewood",
    name: "Rosewood",
    description: "Warm & refined",
    neutralHue: 350,
    neutralSat: 10,
    primaryHue: 350,
    primarySat: 42,
    accentHue: 20,
    accentSat: 45,
  },
  {
    id: "warm-sand",
    name: "Warm Sand",
    description: "Soft & earthy",
    neutralHue: 38,
    neutralSat: 16,
    primaryHue: 32,
    primarySat: 50,
    accentHue: 20,
    accentSat: 40,
  },
  {
    id: "paper-cream",
    name: "Paper Cream",
    description: "Light & airy",
    neutralHue: 46,
    neutralSat: 20,
    primaryHue: 24,
    primarySat: 35,
    accentHue: 40,
    accentSat: 35,
  },
  {
    id: "slate",
    name: "Slate",
    description: "Cool & minimal",
    neutralHue: 216,
    neutralSat: 8,
    primaryHue: 216,
    primarySat: 22,
    accentHue: 200,
    accentSat: 20,
  },
  {
    id: "nordic",
    name: "Nordic",
    description: "Crisp & Scandinavian",
    neutralHue: 198,
    neutralSat: 12,
    primaryHue: 195,
    primarySat: 38,
    accentHue: 170,
    accentSat: 30,
  },
]

export function buildVariant(
  seed: ThemeSeed,
  mode: "light" | "dark"
): ThemeTokens {
  const dark = mode === "dark"
  const {
    neutralHue: nh,
    neutralSat: ns,
    primaryHue: ph,
    primarySat: ps,
    accentHue: ah,
    accentSat: as_,
  } = seed
  const primaryL = dark ? 60 : 46
  const primaryFgL = dark ? 11 : 98

  return {
    background: hslToHex(nh, ns, dark ? 8 : 98),
    foreground: hslToHex(nh, 8, dark ? 95 : 13),
    card: hslToHex(nh, ns, dark ? 11 : 100),
    cardForeground: hslToHex(nh, 8, dark ? 95 : 13),
    popover: hslToHex(nh, ns, dark ? 12 : 100),
    popoverForeground: hslToHex(nh, 8, dark ? 95 : 13),
    primary: hslToHex(ph, ps, primaryL),
    primaryForeground: hslToHex(ph, 20, primaryFgL),
    secondary: hslToHex(nh, ns, dark ? 18 : 94),
    secondaryForeground: hslToHex(nh, 8, dark ? 92 : 18),
    muted: hslToHex(nh, ns, dark ? 16 : 95),
    mutedForeground: hslToHex(nh, 8, dark ? 65 : 45),
    accent: hslToHex(ah, as_, dark ? 22 : 93),
    accentForeground: hslToHex(ah, 40, dark ? 90 : 24),
    destructive: hslToHex(4, 72, dark ? 55 : 50),
    destructiveForeground: "#ffffff",
    border: hslToHex(nh, ns, dark ? 20 : 89),
    input: hslToHex(nh, ns, dark ? 20 : 89),
    ring: hslToHex(ph, ps, primaryL),
    sidebar: hslToHex(nh, ns, dark ? 6 : 96),
    sidebarForeground: hslToHex(nh, 8, dark ? 95 : 13),
    sidebarPrimary: hslToHex(ph, ps, primaryL),
    sidebarPrimaryForeground: hslToHex(ph, 20, primaryFgL),
    sidebarAccent: hslToHex(nh, ns, dark ? 15 : 92),
    sidebarBorder: hslToHex(nh, ns, dark ? 18 : 88),
    sidebarRing: hslToHex(ph, ps, primaryL),
    chart1: hslToHex(ph, 60, 55),
    chart2: hslToHex((ph + 40) % 360, 55, 55),
    chart3: hslToHex((ph + 80) % 360, 50, 50),
    chart4: hslToHex((ah + 20) % 360, 55, 60),
    chart5: hslToHex((ah + 160) % 360, 50, 55),
  }
}

export const THEMES: Record<ThemeName, ThemeDefinition> = THEME_SEEDS.reduce(
  (acc, seed) => {
    acc[seed.id] = {
      ...seed,
      light: buildVariant(seed, "light"),
      dark: buildVariant(seed, "dark"),
    }
    return acc
  },
  {} as Record<ThemeName, ThemeDefinition>
)

/** Lightweight metadata for theme cards — import this in UI, not the full THEMES map, where you only need swatch colors (spec #19). */
export const THEME_PREVIEWS: ThemePreviewMeta[] = THEME_SEEDS.map((seed) => {
  const t = THEMES[seed.id].light
  return {
    id: seed.id,
    name: seed.name,
    description: seed.description,
    preview: {
      background: t.background,
      foreground: t.foreground,
      primary: t.primary,
      card: t.card,
    },
  }
})

export const TOKEN_CSS_VAR_MAP: Record<keyof ThemeTokens, string> = {
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  destructive: "--destructive",
  destructiveForeground: "--destructive-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  sidebar: "--sidebar",
  sidebarForeground: "--sidebar-foreground",
  sidebarPrimary: "--sidebar-primary",
  sidebarPrimaryForeground: "--sidebar-primary-foreground",
  sidebarAccent: "--sidebar-accent",
  sidebarBorder: "--sidebar-border",
  sidebarRing: "--sidebar-ring",
  chart1: "--chart-1",
  chart2: "--chart-2",
  chart3: "--chart-3",
  chart4: "--chart-4",
  chart5: "--chart-5",
}
