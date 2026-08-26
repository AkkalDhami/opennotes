/**
 * Primary navigation items, shared by the server-rendered navbar and the client
 * `NavLinks` component.
 *
 * These live in their own module on purpose. When the array was exported from
 * `navbar.tsx`, the client component importing it pulled that whole file's
 * dependency graph into the browser bundle — `getCurrentUser`, and through it
 * `next/headers` — which Next.js rejects at build time. A constants module has
 * no server-only imports, so either side can read it safely.
 */
export const NAV_LINKS = [
  { href: "/notes", label: "Notes" },
  { href: "/contributors", label: "Contributors" },
  { href: "/settings", label: "Settings" },
  { href: "/contribution", label: "Contribute" },
]
