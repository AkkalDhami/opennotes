"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react"
import {
  FilterHorizontalIcon,
  Cancel01Icon,
  GraduationCapIcon,
  BookOpen01Icon,
  LayerIcon,
  MinimizeIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUrlState } from "./collection-search"
import { Label } from "@/components/ui/label"
import {
  getCourseName,
  getEducationLevelName,
  getSubjectName,
} from "@/utils/get-edu-name"

type Opt = {
  value: string
  label: string
}
export type FilterOptions = {
  levels: string[]
  courses: Opt[]
  subjects: Opt[]
  creators?: Opt[]
}

const SIZES: Opt[] = [
  { value: "1-5", label: "1-5 notes" },
  { value: "6-20", label: "6-20 notes" },
  { value: "21-50", label: "21-50 notes" },
  { value: "50+", label: "50+ notes" },
]
const ALL = "__all"
const KEYS = ["level", "course", "subject", "size"] as const

export function CollectionFilters({ options }: { options: FilterOptions }) {
  const sp = useSearchParams(),
    set = useUrlState()
  const active = KEYS.filter((k) => sp.get(k))
  const [open, setOpen] = useState(active.length > 0)

  const fields: {
    key: (typeof KEYS)[number]
    label: string
    opts: Opt[]
    icon: IconSvgElement
  }[] = [
    {
      key: "level",
      label: "Education level",
      opts: options.levels.map((l) => ({
        value: l,
        label: getEducationLevelName(l) ?? l,
      })),
      icon: GraduationCapIcon,
    },
    {
      key: "course",
      label: "Course",
      opts: options.courses.map((c) => ({
        value: c.value,
        label: getCourseName(c.label) ?? c.label,
      })),
      icon: BookOpen01Icon,
    },
    {
      key: "subject",
      label: "Subject",
      opts: options.subjects.map((s) => ({
        value: s.value,
        label: getSubjectName(s.label) ?? s.label,
      })),
      icon: LayerIcon,
    },
    // {
    //   key: "creatorId",
    //   label: "Creator",
    //   opts: options.creators.map((c) => ({ value: c.value, label: c.label })),
    //   icon: UserIcon,
    // },
    {
      key: "size",
      label: "Collection size",
      opts: SIZES,
      icon: MinimizeIcon,
    },
  ]
  const labelOf = (k: string, v: string) =>
    fields.find((f) => f.key === k)?.opts.find((o) => o.value === v)?.label ?? v

  return (
    <div className="w-full space-y-3 sm:w-[80%]">
      <div className="flex w-full flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          aria-expanded={open}
          aria-controls="collection-filter-panel"
          onClick={() => setOpen((o) => !o)}
        >
          <HugeiconsIcon
            icon={FilterHorizontalIcon}
            size={16}
            color="currentColor"
            strokeWidth={2}
            className="size-4"
          />
          Filters{active.length > 0 && ` · ${active.length}`}
        </Button>
        {active.map((k) => (
          <button
            key={k}
            onClick={() => set({ [k]: null })}
            aria-label={`Remove filter ${labelOf(k, sp.get(k)!)}`}
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm hover:border-foreground/30"
          >
            {labelOf(k, sp.get(k)!)}
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={12}
              color="currentColor"
              strokeWidth={2}
              className="size-3"
            />
          </button>
        ))}
        {active.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => set(Object.fromEntries(KEYS.map((k) => [k, null])))}
          >
            Clear all
          </Button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="collection-filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full overflow-hidden"
          >
            <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
              {fields.map((f) => (
                <div key={f.key} className="space-y-1.5 text-sm">
                  <Label
                    id={`filter-${f.key}`}
                    className="mb-1.5 text-muted-foreground"
                  >
                    <HugeiconsIcon
                      icon={f.icon}
                      size={18}
                      color="currentColor"
                      strokeWidth={2}
                      className="size-4"
                    />
                    {f.label}
                  </Label>
                  <Select
                    items={[{ value: ALL, label: "All" }, ...f.opts]}
                    value={sp.get(f.key) ?? ALL}
                    onValueChange={(v) =>
                      set({ [f.key]: v === ALL ? null : (v as string) })
                    }
                  >
                    <SelectTrigger
                      aria-labelledby={`filter-${f.key}`}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      alignItemWithTrigger={false}
                      className="max-h-72"
                    >
                      <SelectItem value={ALL}>All</SelectItem>
                      {f.opts.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
