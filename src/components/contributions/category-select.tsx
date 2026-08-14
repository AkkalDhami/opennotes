"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { SelectOption } from "@/components/shared/search-select"

const NONE_VALUE = "__none__"

interface CategorySelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
}

export function CategorySelect({
  options,
  value,
  onChange,
  disabled,
  id,
}: CategorySelectProps) {
  return (
    <Select
      value={value || NONE_VALUE}
      onValueChange={(next) => onChange(next === NONE_VALUE ? "" : (next ?? ""))}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Select category..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>No category</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
