/**
 * Arrow-key roving focus for a `role="radiogroup"` built from plain
 * `role="radio"` buttons. Wire it to the group container's `onKeyDown`.
 * (We're not using Base UI's Radio/RadioGroup here since these controls
 * are card-style, not the usual small circular radio — same semantics,
 * custom visuals. Swap for Base UI's `RadioGroup` if you'd rather keep a
 * single radio implementation across the app.)
 */
export function handleRadioGroupKeyDown(
  e: React.KeyboardEvent<HTMLDivElement>
) {
  if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key))
    return
  const items = Array.from(
    e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')
  )
  const currentIndex = items.indexOf(document.activeElement as HTMLElement)
  if (currentIndex === -1) return
  e.preventDefault()
  const nextIndex =
    e.key === "ArrowRight" || e.key === "ArrowDown"
      ? (currentIndex + 1) % items.length
      : (currentIndex - 1 + items.length) % items.length
  items[nextIndex].focus()
  items[nextIndex].click()
}
