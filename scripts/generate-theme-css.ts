import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  THEME_SEEDS,
  THEMES,
  TOKEN_CSS_VAR_MAP,
  ThemeTokens,
} from "../src/lib/appearance/themes"

function block(selector: string, tokens: ThemeTokens): string {
  const lines = (Object.keys(TOKEN_CSS_VAR_MAP) as (keyof ThemeTokens)[])
    .map((key) => `  ${TOKEN_CSS_VAR_MAP[key]}: ${tokens[key]};`)
    .join("\n")
  return `${selector} {\n${lines}\n}`
}

const header = `/**
 * GENERATED FILE — do not edit by hand.
 * Source: src/lib/appearance/themes.ts
 * Regenerate with: npx tsx scripts/generate-theme-css.ts
 *
 * Selector strategy avoids specificity fights with the base :root / .dark
 * rules already in globals.css: attribute selectors on the same element
 * (html) as the .dark class, scoped per theme, override the base tokens
 * without needing !important (spec #27).
 */\n`

const parts: string[] = [header]

for (const seed of THEME_SEEDS) {
  const def = THEMES[seed.id]
  parts.push(block(`:root[data-theme="${seed.id}"]`, def.light))
  parts.push(block(`.dark[data-theme="${seed.id}"]`, def.dark))
}

const css = parts.join("\n\n") + "\n"
const outPath = resolve(__dirname, "../src/styles/themes.css")
writeFileSync(outPath, css, "utf8")
console.log(`Wrote ${outPath} (${THEME_SEEDS.length} themes x 2 modes)`)
