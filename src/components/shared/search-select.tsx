"use client"

import { useState } from "react"

import { ArrowDown01Icon, CheckmarkCircle01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { HugeiconsIcon } from "@hugeicons/react"

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

import { cn } from "@/lib/utils"

export interface SelectOption {
  id: string
  name: string
}

interface SearchSelectProps {
  options: SelectOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  disabled?: boolean
  id?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  multiple?: boolean
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  disabled = false,
  id,
  multiple = false,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false)

  /*
   * Single select
   */
  const selected = !multiple
    ? options.find((option) => option.id === value)
    : undefined

  /*
   * Multiple select
   */
  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : []

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.id)
  )

  const handleSelect = (optionId: string) => {
    if (!multiple) {
      onChange(optionId)
      setOpen(false)
      return
    }

    const currentValues = Array.isArray(value) ? value : []

    if (currentValues.includes(optionId)) {
      onChange(currentValues.filter((id) => id !== optionId))
    } else {
      onChange([...currentValues, optionId])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span
              className={cn(
                "truncate",
                !selected && !selectedOptions.length && "text-muted-foreground"
              )}
            >
              {multiple
                ? selectedOptions.length > 0
                  ? selectedOptions.length === 1
                    ? selectedOptions[0].name
                    : `${selectedOptions.length} selected`
                  : placeholder
                : selected
                  ? selected.name
                  : placeholder}
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
          <CommandInput placeholder={searchPlaceholder} />

          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            <CommandGroup>
              {options.map((option) => {
                const isSelected = multiple
                  ? selectedValues.includes(option.id)
                  : value === option.id

                return (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => handleSelect(option.id)}
                    className="flex items-center justify-between"
                  >
                    <span>{option.name}</span>
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      strokeWidth={2}
                      className={cn(
                        "size-4 text-green-600",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                      aria-hidden="true"
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
