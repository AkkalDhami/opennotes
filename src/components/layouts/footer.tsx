import {
  APP_NAME,
  BASE_GITHUB_REPO,
  GITHUB_REPO,
} from "@/constants/app.constants"
import { AxeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Route } from "next"
import Link from "next/link"

const footerLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/guidelines", label: "Contribution Guidelines" },
  { href: "/community", label: "Community Guidelines" },
]

export function Footer() {
  return (
    <footer className="mb-12 border-y text-muted-foreground">
      <div className="mx-auto max-w-6xl space-y-2 border-x px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} | {APP_NAME} | A community library
            of student and teacher notes.
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as Route}
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center justify-center gap-2 text-base">
            Built with{" "}
            <HugeiconsIcon
              icon={AxeIcon}
              size={18}
              color="currentColor"
              strokeWidth={1.8}
              className="size-4"
            />
            by{" "}
            <Link
              href={BASE_GITHUB_REPO}
              target="_blank"
              className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Akkal Dhami
            </Link>
          </p>

          <p className="flex items-center justify-center gap-2 text-base">
            Open source on{" "}
            <Link
              href={GITHUB_REPO}
              target="_blank"
              className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              GitHub
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
