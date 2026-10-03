"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  BookOpen01Icon,
  UserGroupIcon,
  CloudUploadIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"

const FEATURES: { icon: IconSvgElement; title: string; description: string }[] =
  [
    {
      icon: BookOpen01Icon,
      title: "Quality Content",
      description:
        "Access well-organized, high-quality notes from verified contributors.",
    },
    {
      icon: UserGroupIcon,
      title: "Community Driven",
      description: "Learn from peers, contribute and grow together.",
    },
    {
      icon: CloudUploadIcon,
      title: "Easy Access",
      description: "Read online or download for offline learning.",
    },
    {
      icon: Shield01Icon,
      title: "Free & Open Source",
      description: "Built for the community, by the community.",
    },
  ]

export function FeaturesStrip() {
  return (
    <section className="border-t border-border/60">
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-y-8 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
        {FEATURES.map(({ icon, title, description }) => (
          <li key={title} className={"flex items-start gap-4 lg:px-8"}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={icon} size={20} strokeWidth={1.8} />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
