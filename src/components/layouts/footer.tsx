import { APP_NAME, GITHUB_REPO, PORTFOLIO_URL } from "@/constants/app.constants"
import { AxeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Route } from "next"
import Link from "next/link"
import { Signature } from "../ui/signature"

const footerLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/guidelines", label: "Contribution Guidelines" },
  { href: "/community", label: "Community Guidelines" },
]

export function Footer() {
  return (
    <footer className="relative mb-12 border-y text-muted-foreground">
      {/* <NoiseTexture noiseOpacity={0.1} /> */}
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
                className="underline-offset-2 hover:text-primary hover:underline"
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
              href={PORTFOLIO_URL}
              target="_blank"
              className="text-muted-foreground underline underline-offset-2 hover:text-primary"
            >
              Akkal Dhami
            </Link>
          </p>

          <p className="flex items-center justify-center gap-2 text-base">
            Open source on{" "}
            <Link
              href={GITHUB_REPO}
              target="_blank"
              className="text-muted-foreground underline underline-offset-2 hover:text-primary"
            >
              GitHub
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center mask-b-from-40%">
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
