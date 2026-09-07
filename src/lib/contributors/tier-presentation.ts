import {
  Award01Icon,
  Diamond01Icon,
  FireIcon,
  Rocket01Icon,
  SparklesIcon,
  StarIcon,
} from "@hugeicons/core-free-icons"
import { IconSvgObject } from "@hugeicons/core-free-icons/types"

export interface TierPresentation {
  icon: IconSvgObject
  /** Tailwind text/border color token */
  accent: string
  /** Tailwind background token, usually a soft tint of `accent` */
  soft: string
  /** CSS gradient for larger badge/tier chips */
  gradient: string
}

const TIER_PRESENTATION: Record<number, TierPresentation> = {
  0: {
    icon: SparklesIcon,
    accent: "text-stone-500",
    soft: "bg-stone-100 dark:bg-stone-800/60",
    gradient: "from-stone-400 to-stone-300",
  },
  1: {
    icon: StarIcon,
    accent: "text-emerald-600",
    soft: "bg-emerald-50 dark:bg-emerald-950/40",
    gradient: "from-emerald-500 to-emerald-300",
  },
  2: {
    icon: Award01Icon,
    accent: "text-sky-600",
    soft: "bg-sky-50 dark:bg-sky-950/40",
    gradient: "from-sky-500 to-sky-300",
  },
  3: {
    icon: FireIcon,
    accent: "text-amber-600",
    soft: "bg-amber-50 dark:bg-amber-950/40",
    gradient: "from-amber-500 to-amber-300",
  },
  4: {
    icon: Rocket01Icon,
    accent: "text-violet-600",
    soft: "bg-violet-50 dark:bg-violet-950/40",
    gradient: "from-violet-500 to-violet-300",
  },
  5: {
    icon: Diamond01Icon,
    accent: "text-rose-600",
    soft: "bg-rose-50 dark:bg-rose-950/40",
    gradient: "from-rose-500 via-fuchsia-400 to-violet-400",
  },
}

export function getTierPresentation(tier: number): TierPresentation {
  return TIER_PRESENTATION[tier] ?? TIER_PRESENTATION[0]
}

/** Every badge slug maps to an icon independent of its DB row. */
const BADGE_ICON_OVERRIDES: Record<string, IconSvgObject> = {
  "top-contributor": Diamond01Icon,
  "consistent-contributor": FireIcon,
  "multi-subject-contributor": SparklesIcon,
}

export function getBadgeIcon(slug: string, tier: number): IconSvgObject {
  return BADGE_ICON_OVERRIDES[slug] ?? getTierPresentation(tier).icon
}
