import { APP_NAME } from "@/constants/app.constants"
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
    <footer className="mb-12 border-y text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-x px-4 py-6 md:flex-row">
        <p>
          &copy; {new Date().getFullYear()} | {APP_NAME} | A community library
          of student and teacher notes.
        </p>
        <div className="flex gap-6">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href as Route}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
