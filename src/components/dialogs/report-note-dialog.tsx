"use client"

import { useEffect, useTransition } from "react"
import { Controller, useForm, type DefaultValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"
import {
  REPORT_REASON_LABELS,
  SubmitReportInput,
  SubmitReportSchema,
} from "@/validations/report"
import { submitNoteReport } from "@/lib/reports/reports"
import { ReportReasonType } from "@/db"
import { useModal } from "@/hooks/use-modal-store"
import { Spinner } from "@/components/ui/spinner"

/** Blank baseline, used before a note is loaded and again on close. */
const EMPTY_VALUES: DefaultValues<SubmitReportInput> = {
  noteId: "",
  reason: undefined,
  explanation: "",
}

export function ReportNoteDialog() {
  const { close, isOpen, type, data } = useModal()

  const isModalOpen = isOpen && type === "report-note"

  const { reportNoteId } = data ?? {}

  const [isPending, startTransition] = useTransition()

  const form = useForm<SubmitReportInput>({
    resolver: zodResolver(SubmitReportSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!isModalOpen) return
    form.reset({ ...EMPTY_VALUES, noteId: reportNoteId ?? "" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, reportNoteId])

  function handleClose() {
    close()
    form.reset(EMPTY_VALUES)
  }

  function onSubmit(values: SubmitReportInput) {
    if (!reportNoteId) {
      toast.error("This note could not be identified.")
      return
    }

    startTransition(async () => {
      const result = await submitNoteReport({ ...values, noteId: reportNoteId })

      if (result.success) {
        toast.success("Report submitted successfully.")
        handleClose()
        return
      }

      switch (result.code) {
        case "ALREADY_REPORTED":
          toast.error("You've already reported this note.")
          break
        case "RATE_LIMITED":
          toast.error(result.message)
          break
        case "INVALID_INPUT":
          if (result.fieldErrors) {
            for (const [field, message] of Object.entries(result.fieldErrors)) {
              form.setError(field as keyof SubmitReportInput, { message })
            }
          } else {
            toast.error(result.message)
          }
          break
        default:
          toast.error("We couldn't submit your report. Please try again.")
      }
    })
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(openState) => {
        if (!openState) handleClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report this note</DialogTitle>
          <DialogDescription>
            Help us keep OpenNotes trustworthy.
          </DialogDescription>
        </DialogHeader>

        <form
          id="report-note-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <Controller
            control={form.control}
            name="reason"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="report-reason">
                  What&apos;s wrong with this note?
                </FieldLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="report-reason"
                    aria-invalid={!!fieldState.error}
                  >
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(REPORT_REASON_LABELS).map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {REPORT_REASON_LABELS[reason as ReportReasonType]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="explanation"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="report-explanation">
                  Additional details (optional)
                </FieldLabel>
                <Textarea
                  id="report-explanation"
                  rows={4}
                  placeholder="Tell us more about the issue..."
                  aria-invalid={!!fieldState.error}
                  className="resize-none"
                  {...field}
                />
                <FieldDescription>Up to 1000 characters.</FieldDescription>
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
          {/* `noteId` is carried in a hidden value, so an error on it has no
              field of its own to render into. Without this, that failure looks
              like a dead Submit button. */}
          <FieldError>{form.formState.errors.noteId?.message}</FieldError>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="report-note-form"
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Spinner /> Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
