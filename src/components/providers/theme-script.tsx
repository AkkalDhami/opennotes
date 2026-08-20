/**
 * Renders a synchronous, render-blocking <script> in <head> (before
 * hydration) that reads the persisted Zustand state directly from
 * localStorage and applies `data-theme` / `data-mode` / the CSS custom
 * properties for radius + font onto <html> — the same technique
 * next-themes / shadcn use to avoid a flash of the wrong theme (spec #11).
 *
 * Mount this once in the root layout, as early as possible in <head>:
 *
 *   <html suppressHydrationWarning>
 *     <head>
 *       <ThemeScript />
 *     </head>
 *     <body className={FONT_VARIABLES}>{children}</body>
 *   </html>
 *
 * `suppressHydrationWarning` on <html> is required because this script
 * mutates attributes on the server-rendered <html> node before React
 * hydrates it.
 */
export function ThemeScript() {
  const script = `
(function () {
  try {
    var STORAGE_KEY = "opennotes-preferences";
    var raw = localStorage.getItem(STORAGE_KEY);
    var prefs = raw ? JSON.parse(raw).state : null;

    var mode = (prefs && prefs.mode) || "system";
    var theme = (prefs && prefs.theme) || "carbon";
    var radius = (prefs && prefs.radius) || "default";

    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var effectiveMode = mode === "system" ? (systemDark ? "dark" : "light") : mode;

    var root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-mode", effectiveMode);
    root.classList.toggle("dark", effectiveMode === "dark");

    var radiusRem = { none: 0, compact: 0.375, default: 0.5, rounded: 0.75 }[radius];
    if (typeof radiusRem === "number") {
      root.style.setProperty("--radius", radiusRem + "rem");
    }
  } catch (e) {
    // localStorage unavailable (SSR edge cases, privacy mode) — fall back
    // to the default theme already baked into globals.css / themes.css.
  }
})();
`.trim()
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
