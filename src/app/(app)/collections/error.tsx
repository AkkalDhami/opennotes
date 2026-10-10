"use client"
import { Button } from "@/components/ui/button"
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-md space-y-4 py-32 text-center">
      <h2 className="font-serif text-2xl">
        We couldn&lsquo;t load collections.
      </h2>
      <p className="text-muted-foreground">Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  )
}
