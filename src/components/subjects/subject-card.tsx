import Link from "next/link"
import type { Subject } from "@/data/subjects"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"

interface SubjectCardProps {
  subject: Subject
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const Icon = subject.icon

  return (
    <Link
      href={`/subjects/${subject.slug}`}
      aria-label={`Browse ${subject.name} notes — ${subject.noteCount} notes available`}
      className="group relative flex items-center justify-between gap-4 rounded-lg border bg-card p-5 text-card-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <div className="flex items-center gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HugeiconsIcon
            icon={Icon}
            size={21}
            strokeWidth={1.8}
            className="size-5"
            aria-hidden="true"
          />
        </div>

        <div>
          <p className="leading-snug font-medium text-foreground">
            {subject.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {subject.noteCount} notes
          </p>
        </div>
      </div>
      <HugeiconsIcon
        icon={ArrowRight02Icon}
        size={24}
        color="currentColor"
        strokeWidth={2}
        className="size-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
        aria-hidden="true"
      />
    </Link>
  )
}
