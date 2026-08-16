export function isActiveLink(
  pathname: string,
  href: string,
  aliases: string[] = []
) {
  if (href === "/") return pathname === "/"

  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`^${escaped}(/|$)`)

  if (regex.test(pathname)) return true

  return aliases.some((alias) => {
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return new RegExp(`^${escapedAlias}(/|$)`).test(pathname)
  })
}
