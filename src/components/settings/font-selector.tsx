"use client"

import { useState } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  CATEGORY_LABELS,
  FONT_CATEGORIES,
  FONT_LABELS,
  type FontCategory,
} from "@/lib/appearance/preferences"
import { FONT_FAMILY_STACKS } from "@/lib/appearance/fonts"
import { useAppearanceStore } from "@/hooks/use-appearance-store"
import { cn } from "@/lib/utils"

const CATEGORIES = Object.keys(FONT_CATEGORIES) as FontCategory[]

export function FontSelector() {
  const fontFamily = useAppearanceStore((s) => s.fontFamily)
  const setFontFamily = useAppearanceStore((s) => s.setFontFamily)
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal sm:w-56"
          >
            <span
              className="truncate"
              style={{ fontFamily: FONT_FAMILY_STACKS[fontFamily] }}
            >
              {FONT_LABELS[fontFamily]}
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="size-4 shrink-0 opacity-60"
              aria-hidden="true"
            />
          </Button>
        }
      />

      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] p-0"
      >
        <Command>
          <CommandInput placeholder="Search fonts..." />

          <CommandList>
            <CommandEmpty>No font found.</CommandEmpty>

            {CATEGORIES.map((category) => (
              <CommandGroup key={category} heading={CATEGORY_LABELS[category]}>
                {FONT_CATEGORIES[category].map((key) => {
                  const isSelected = fontFamily === key

                  return (
                    <CommandItem
                      key={key}
                      value={`${FONT_LABELS[key]} ${CATEGORY_LABELS[category]}`}
                      onSelect={() => {
                        setFontFamily(key)
                        setOpen(false)
                      }}
                    >
                      <span
                        className="truncate"
                        style={{ fontFamily: FONT_FAMILY_STACKS[key] }}
                      >
                        {FONT_LABELS[key]}
                      </span>
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        strokeWidth={2}
                        className={cn(
                          "ml-auto size-4 shrink-0 text-green-600",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                        aria-hidden="true"
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
