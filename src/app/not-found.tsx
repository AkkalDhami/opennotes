import { ShaderFire } from "@/components/ui/shader-fire"
import Link from "next/link"

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      {" "}
      <ShaderFire />
      <div className="relative w-full max-w-lg text-center">
        <p className="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
          Error 404
        </p>

        <h1 className="text-7xl font-bold tracking-tight sm:text-8xl">404</h1>

        <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          Page not found
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist, has been moved,
          or may have been removed.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go home
          </Link>

          <Link
            href="/notes"
            className="inline-flex h-10 items-center justify-center rounded-lg border px-5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Browse notes
          </Link>
        </div>
      </div>
    </main>
  )
}
