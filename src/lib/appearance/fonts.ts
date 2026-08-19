import {
  Geist,
  Inter,
  Manrope,
  DM_Sans,
  Source_Sans_3,
  Roboto,
  Open_Sans,
  Plus_Jakarta_Sans,
  Space_Grotesk,
  Sora,
  Figtree,
  Outfit,
  Public_Sans,
  Bricolage_Grotesque,
  Montserrat,
  Lora,
  Merriweather,
  Playfair_Display,
  Source_Serif_4,
  Fraunces,
  Geist_Mono,
  JetBrains_Mono,
  Fira_Code,
  Roboto_Mono,
  Source_Code_Pro,
  Space_Mono,
  IBM_Plex_Mono,
} from "next/font/google"
import type { FontFamily } from "./preferences"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
})
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
})
const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
})
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
})
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
})
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
})
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
})
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})
const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
})
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
})
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
})
const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
})
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
})
const sourceSerifPro = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif-pro",
  display: "swap",
})
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})
const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
})
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
})
const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
  display: "swap",
})
const spaceMono = Space_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
})
const ibmPlexMono = IBM_Plex_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
})

export const FONT_VARIABLES = [
  geist.variable,
  inter.variable,
  manrope.variable,
  dmSans.variable,
  sourceSans.variable,
  roboto.variable,
  openSans.variable,
  plusJakartaSans.variable,
  spaceGrotesk.variable,
  sora.variable,
  figtree.variable,
  outfit.variable,
  publicSans.variable,
  bricolageGrotesque.variable,
  montserrat.variable,
  lora.variable,
  merriweather.variable,
  playfairDisplay.variable,
  sourceSerifPro.variable,
  fraunces.variable,
  geistMono.variable,
  jetbrainsMono.variable,
  firaCode.variable,
  robotoMono.variable,
  sourceCodePro.variable,
  spaceMono.variable,
  ibmPlexMono.variable,
].join(" ")

export const FONT_FAMILY_STACKS: Record<FontFamily, string> = {
  geist: `var(--font-geist), ui-sans-serif, system-ui, sans-serif`,
  inter: `var(--font-inter), ui-sans-serif, system-ui, sans-serif`,
  manrope: `var(--font-manrope), ui-sans-serif, system-ui, sans-serif`,
  "dm-sans": `var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif`,
  "source-sans": `var(--font-source-sans), ui-sans-serif, system-ui, sans-serif`,
  roboto: `var(--font-roboto), ui-sans-serif, system-ui, sans-serif`,
  "open-sans": `var(--font-open-sans), ui-sans-serif, system-ui, sans-serif`,
  "plus-jakarta-sans": `var(--font-plus-jakarta-sans), ui-sans-serif, system-ui, sans-serif`,
  "space-grotesk": `var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif`,
  sora: `var(--font-sora), ui-sans-serif, system-ui, sans-serif`,
  figtree: `var(--font-figtree), ui-sans-serif, system-ui, sans-serif`,
  outfit: `var(--font-outfit), ui-sans-serif, system-ui, sans-serif`,
  "public-sans": `var(--font-public-sans), ui-sans-serif, system-ui, sans-serif`,
  "bricolage-grotesque": `var(--font-bricolage-grotesque), ui-sans-serif, system-ui, sans-serif`,
  montserrat: `var(--font-montserrat), ui-sans-serif, system-ui, sans-serif`,
  lora: `var(--font-lora), ui-serif, Georgia, serif`,
  merriweather: `var(--font-merriweather), ui-serif, Georgia, serif`,
  "playfair-display": `var(--font-playfair-display), ui-serif, Georgia, serif`,
  "source-serif-pro": `var(--font-source-serif-pro), ui-serif, Georgia, serif`,
  fraunces: `var(--font-fraunces), ui-serif, Georgia, serif`,
  "geist-mono": `var(--font-geist-mono), ui-monospace, "SF Mono", monospace`,
  "jetbrains-mono": `var(--font-jetbrains-mono), ui-monospace, "SF Mono", monospace`,
  "fira-code": `var(--font-fira-code), ui-monospace, "SF Mono", monospace`,
  "roboto-mono": `var(--font-roboto-mono), ui-monospace, "SF Mono", monospace`,
  "source-code-pro": `var(--font-source-code-pro), ui-monospace, "SF Mono", monospace`,
  "space-mono": `var(--font-space-mono), ui-monospace, "SF Mono", monospace`,
  "ibm-plex-mono": `var(--font-ibm-plex-mono), ui-monospace, "SF Mono", monospace`,
  system: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`,
  serif: `ui-serif, Georgia, "Times New Roman", serif`,
  mono: `ui-monospace, "SF Mono", "Cascadia Code", monospace`,
}
