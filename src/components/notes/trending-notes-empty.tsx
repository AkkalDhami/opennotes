import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function TrendingNotesEmpty() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <HugeiconsIcon
          icon={FileAddIcon}
          size={24}
          color="currentColor"
          strokeWidth={1.5}
        />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">No trending notes yet.</p>
        <p className="text-sm text-muted-foreground">
          Be one of the first to share a note with the community.
        </p>
      </div>
      <Link href="/contribution" className={cn(buttonVariants(), "mt-1")}>
        Share your notes
      </Link>
    </div>
  )
}
