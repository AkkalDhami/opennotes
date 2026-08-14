import Link from "next/link"

import { Button } from "@/components/ui/button"

interface UsersEmptyStateProps {
  hasActiveFilters: boolean
}

export function UsersEmptyState({ hasActiveFilters }: UsersEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <div className="space-y-1">
        <p className="font-medium text-foreground">
          {hasActiveFilters ? "No users found." : "No users yet."}
        </p>
        <p className="text-sm text-muted-foreground">
          {hasActiveFilters
            ? "Try changing your search or filters."
            : "Users will appear here when they create an account."}
        </p>
      </div>
      {hasActiveFilters ? (
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/users">Clear filters</Link>}
        ></Button>
      ) : null}
    </div>
  )
}
