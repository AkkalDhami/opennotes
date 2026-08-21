"use client"

import { handleRadioGroupKeyDown } from "@/hooks/use-roving-radio-group"
import { cn } from "@/lib/utils"

export function SegmentedControl<T extends string>({
  groupLabel,
  options,
  value,
  onChange,
}: {
  groupLabel: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      onKeyDown={handleRadioGroupKeyDown}
      className="inline-flex flex-wrap gap-1.5"
    >
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary text-secondary-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
