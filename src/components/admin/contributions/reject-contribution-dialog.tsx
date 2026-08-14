"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  rejectContributionSchema,
  type RejectContributionInput,
} from "@/validations/contribution-filter"
import { rejectContribution } from "@/lib/admin/contributions"

export function RejectContributionDialog({ noteId }: { noteId: string }) {
  const [open, setOpen] = useState(false)

  const form = useForm<RejectContributionInput>({
    resolver: zodResolver(rejectContributionSchema),
    defaultValues: { reason: "" },
  })

  async function onSubmit(values: RejectContributionInput) {
    const result = await rejectContribution(noteId, values.reason)
    if (result.success) {
      toast.success(result.message)
      form.reset()
      setOpen(false)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset()
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={16}
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />
            Reject
          </Button>
        }
      ></DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Reject contribution</DialogTitle>
            <DialogDescription>
              Please provide a reason so the contributor can understand why this
              note was rejected.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Textarea
              {...form.register("reason")}
              placeholder="e.g. This document appears to be a duplicate of an already published note."
              rows={4}
              aria-invalid={!!form.formState.errors.reason}
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Rejecting..."
                : "Reject contribution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
