"use client"

import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { ResolveReportInput, ResolveReportSchema } from "@/validations/report"
import { resolveReport } from "@/lib/reports/reports"

export function ResolveReportDialog({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<ResolveReportInput>({
    resolver: zodResolver(ResolveReportSchema),
    defaultValues: { reportId, resolutionNote: "" },
  })

  function onSubmit(values: ResolveReportInput) {
    startTransition(async () => {
      const result = await resolveReport(values)

      if (result.success) {
        toast.success("Report resolved.")
        setOpen(false)
        form.reset({ reportId, resolutionNote: "" })
        router.refresh()
        return
      }

      toast.error(result.message)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={14}
              color="currentColor"
              strokeWidth={2}
              className="size-3.5"
            />
            Resolve Report
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resolve report</DialogTitle>
          <DialogDescription>
            Record what action was taken so the history stays clear.
          </DialogDescription>
        </DialogHeader>

        <form id="resolve-report-form" onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            control={form.control}
            name="resolutionNote"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="resolution-note">
                  Resolution note
                </FieldLabel>
                <Textarea
                  id="resolution-note"
                  rows={4}
                  placeholder="Explain what action was taken..."
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="resolve-report-form"
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="size-4 animate-spin"
              />
            ) : null}
            Resolve Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
