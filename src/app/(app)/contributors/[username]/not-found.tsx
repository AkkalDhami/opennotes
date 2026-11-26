import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ContributorNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Contributor not found
      </h1>
      <p className="text-muted-foreground">
        This contributor profile doesn&apos;t exist or is no longer available.
      </p>
      <Button
        nativeButton={false}
        render={<Link href="/contributors">Browse Contributors</Link>}
        className="mt-2"
      />
    </div>
  )
}
