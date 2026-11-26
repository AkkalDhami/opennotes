import { APP_NAME, GITHUB_REPO, PORTFOLIO_URL } from "@/constants/app.constants"
import { AxeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Route } from "next"
import Link from "next/link"
import { Signature } from "@/components/ui/signature"

const footerGroups = [
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/guidelines", label: "Contribution Guidelines" },
      { href: "/community", label: "Community Guidelines" },
    ],
  },
  {
    title: "Support",
    links: [{ href: "/support", label: "Help & Feedback" }],
  },
]

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground"

export function Footer() {
  return (
    <footer className="relative mt-6 mb-12 text-muted-foreground">
      <div className="mx-auto max-w-6xl border-t px-4 pt-14 pb-6 sm:px-0">
        <div className="grid gap-10 md:grid-cols-[1.5fr_2fr]">
          <div className="space-y-3">
            <p className="text-lg font-semibold tracking-tight text-foreground">
              {APP_NAME}
            </p>
            <p className="max-w-xs text-sm leading-relaxed">
              Free study notes shared by students and teachers. Find notes by
              level, course, and subject, or share your own.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3"
          >
            {footerGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <p className="text-xs font-medium tracking-wider text-foreground/70 uppercase">
                  {group.title}
                </p>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href as Route} className={linkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <p className="flex items-center gap-1.5">
              Built with
              <HugeiconsIcon
                icon={AxeIcon}
                size={16}
                color="currentColor"
                strokeWidth={1.8}
                className="size-4"
              />
              by{" "}
              <Link
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
              >
                Akkal Dhami
              </Link>
            </p>
            <span aria-hidden className="hidden h-3 w-px bg-border sm:block" />
            <Link
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 transition-colors hover:text-primary hover:underline"
            >
              Open source on GitHub
            </Link>
          </div>
        </div>

        <div
          aria-hidden
          className="mt-8 flex items-center justify-center mask-b-from-40%"
        >
          <Signature
            text="Akkal Dhami."
            fontSize={20}
            color="var(--color-primary)"
          />
        </div>
      </div>
    </footer>
  )
}
