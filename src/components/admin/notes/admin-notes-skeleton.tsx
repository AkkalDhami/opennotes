import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

function Bar({ className = "" }: { className?: string }) {
  return <div className={cn(`h-4 animate-pulse rounded bg-muted`, className)} />
}

export function AdminNotesSkeleton({ pageSize = 20 }: { pageSize?: number }) {
  const rows = Math.min(pageSize, 10)

  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Note</TableHead>
              <TableHead>Contributor</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Processing</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 shrink-0 animate-pulse rounded-md bg-muted" />
                    <Bar className="w-40" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
                    <Bar className="w-28" />
                  </div>
                </TableCell>
                <TableCell>
                  <Bar className="w-20" />
                </TableCell>
                <TableCell>
                  <Bar className="w-24" />
                </TableCell>
                <TableCell>
                  <Bar className="w-20" />
                </TableCell>
                <TableCell>
                  <Bar className="w-16" />
                </TableCell>
                <TableCell>
                  <Bar className="w-12" />
                </TableCell>
                <TableCell>
                  <Bar className="w-20" />
                </TableCell>
                <TableCell>
                  <div className="size-8 animate-pulse rounded-md bg-muted" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-lg border border-border p-4"
          >
            <Bar className="w-3/4" />
            <Bar className="w-1/2" />
            <Bar className="w-1/3" />
          </div>
        ))}
      </div>
    </>
  )
}
