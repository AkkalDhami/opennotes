import { useEffect, useState } from "react"

export function useOrigin() {
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : ""

  if (!mounted) return ""

  return origin
}
