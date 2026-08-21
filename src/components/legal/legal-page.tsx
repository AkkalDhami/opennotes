import { ReactNode } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Calendar04Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { Container } from "@/components/ui/container"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"

interface LegalSection {
  title: string
  content?: ReactNode
  items?: string[]
}

interface LegalPageProps {
  title: string
  description: string
  lastUpdated: string
  sections: LegalSection[]
}

export function LegalPage({
  title,
  description,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <Container className="space-y-6 border-x px-4 pt-4 pb-6">
      <header className="space-y-2 border-b pb-6">
        <Heading>{title}</Heading>

        <SubHeading>{description}</SubHeading>

        <p className="flex items-center gap-2 text-muted-foreground">
          <HugeiconsIcon
            icon={Calendar04Icon}
            size={18}
            color="currentColor"
            strokeWidth={2}
            className="size-4"
          />
          Last updated: {lastUpdated}
        </p>
      </header>

      <div className="divide-y">
        {sections.map((section, index) => (
          <section key={section.title} className="py-6 first:pt-0">
            <div className="flex gap-4">
              <div className="mt-1 shrink-0">
                <span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary">
                  {index + 1}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-medium tracking-tight">
                  {section.title}
                </h3>

                {section.content && (
                  <div className="mt-3 space-y-4 leading-7 text-muted-foreground">
                    {section.content}
                  </div>
                )}

                {section.items && (
                  <ul className="mt-4 space-y-3">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 leading-6 text-muted-foreground"
                      >
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={18}
                          color="currentColor"
                          strokeWidth={2}
                          className="mt-1 shrink-0 text-primary"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      <footer className="rounded-lg border border-primary/30 bg-primary/10 p-5">
        <div className="flex gap-3">
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={18}
            color="currentColor"
            strokeWidth={2}
            className="mt-1 shrink-0 text-primary"
          />

          <p className="text-base leading-6 text-primary">
            If you have questions about this policy, please contact the
            OpenNotes team through the contact method provided on the platform.
          </p>
        </div>
      </footer>
    </Container>
  )
}
