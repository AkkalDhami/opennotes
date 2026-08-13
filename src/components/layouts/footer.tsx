import { APP_NAME } from "@/constants/app.constant"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="mb-12 border-y text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-x px-4 py-6 md:flex-row">
        <p>
          &copy; {new Date().getFullYear()} | {APP_NAME} | A community library of
          student and teacher notes.
        </p>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-brand">Terms</Link>
          <Link href="/privacy" className="hover:text-brand">Privacy</Link>
          <Link href="/copyright" className="hover:text-brand">Copyright &amp; Takedowns</Link>
        </div>
      </div>
    </footer>
  )
}
