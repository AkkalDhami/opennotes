"use client"

import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { CancelCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons"

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
import { DismissReportInput, DismissReportSchema } from "@/validations/report"
import { dismissReport } from "@/lib/reports/reports"

export function DismissReportDialog({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<DismissReportInput>({
    resolver: zodResolver(DismissReportSchema),
    defaultValues: { reportId, resolutionNote: "" },
  })

  function onSubmit(values: DismissReportInput) {
    startTransition(async () => {
      const result = await dismissReport(values)

      if (result.success) {
        toast.success("Report dismissed.")
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
          <Button variant="outline" size="sm" className="gap-1.5">
            <HugeiconsIcon
              icon={CancelCircleIcon}
              size={14}
              color="currentColor"
              strokeWidth={2}
              className="size-3.5"
            />
            Dismiss Report
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dismiss report</DialogTitle>
          <DialogDescription>
            Record why this report doesn&apos;t need further action.
          </DialogDescription>
        </DialogHeader>

        <form id="dismiss-report-form" onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            control={form.control}
            name="resolutionNote"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="dismissal-note">
                  Reason for dismissal
                </FieldLabel>
                <Textarea
                  id="dismissal-note"
                  rows={4}
                  placeholder="Explain why this report was dismissed..."
                  aria-invalid={!!fieldState.error}
                  {...field}
                  className="resize-none"
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
            form="dismiss-report-form"
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
            Dismiss Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
