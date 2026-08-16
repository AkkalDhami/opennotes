"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";

interface ContributionErrorStateProps {
  onRetry?: () => void;
}

export function ContributionErrorState({ onRetry }: ContributionErrorStateProps) {
  const router = useRouter();
  const handleRetry = onRetry ?? (() => router.refresh());
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <HugeiconsIcon
          icon={Alert02Icon}
          size={20}
          color="currentColor"
          strokeWidth={2}
          className="size-5 text-destructive"
        />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">Unable to load your contributions.</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong on our end. Please try again in a moment.
        </p>
      </div>
      <Button variant="outline" size="sm" className="mt-2" onClick={handleRetry}>
        Try again
      </Button>
    </div>
  );
}
