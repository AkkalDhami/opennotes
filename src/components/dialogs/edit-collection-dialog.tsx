"use client"

import { useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Globe02Icon, IncognitoIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

import { updateCollection } from "@/lib/user/collections"
import {
  UpdateCollectionSchema,
  UpdateCollectionInput,
} from "@/validations/collection"
import { useModal } from "@/hooks/use-modal-store"
import { COLLECTION_VISIBLITY } from "@/db"
import { HugeiconsIcon } from "@hugeicons/react"

/** Blank baseline, used before a collection is loaded and again on close. */
const EMPTY_VALUES: UpdateCollectionInput = {
  id: "",
  name: "",
  description: "",
  visibility: "PRIVATE",
}

export function EditCollectionDialog() {
  const router = useRouter()
  const { close, isOpen, type, data } = useModal()

  const isModalOpen = isOpen && type === "edit-collection"
  const [isPending, startTransition] = useTransition()

  const { editCollection } = data ?? {}

  const form = useForm<UpdateCollectionInput>({
    resolver: zodResolver(UpdateCollectionSchema),
    defaultValues: EMPTY_VALUES,
  })

  /**
   * Load the collection into the form each time the dialog opens.
   *
   * This has to be a `reset`, not a set of `setValue` calls. The dialog is
   * mounted once at the app root with an empty modal store, so `defaultValues`
   * is evaluated before any collection exists — and the previous version never
   * wrote `id` afterwards. `UpdateCollectionSchema` requires a uuid there, so
   * the resolver rejected every submit before it reached the action, with no
   * field on screen to show the error: the Save button simply did nothing.
   *
   * `reset` also re-baselines `isDirty`, which is what gates the Save button.
   */
  useEffect(() => {
    if (!isModalOpen || !editCollection) return
    form.reset({
      id: editCollection.id,
      name: editCollection.name,
      description: editCollection.description ?? "",
      visibility: editCollection.visibility,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, editCollection?.id])

  function handleClose() {
    close()
    form.reset(EMPTY_VALUES)
  }

  function handleSubmit(values: UpdateCollectionInput) {
    if (!editCollection) return

    startTransition(async () => {
      const result = await updateCollection({
        id: editCollection.id,
        name: values.name,
        description: values.description,
        visibility: values.visibility,
      })

      if (!result.ok) {
        toast.error(result.error || "Failed to update collection.")
        return
      }

      toast.success(`Collection "${values.name}" was updated successfully`)

      handleClose()

      router.refresh()
    })
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(openState) => {
        if (!openState) {
          handleClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          id="edit-collection-form"
        >
          <FieldGroup>
            <DialogHeader>
              <DialogTitle>Edit collection</DialogTitle>

              <DialogDescription>
                Update the name or description of this collection.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-collection-name">
                      Name <span className="text-destructive">*</span>
                    </FieldLabel>

                    <Input
                      {...field}
                      id="edit-collection-name"
                      placeholder="BCA 1st Semester"
                      maxLength={120}
                      autoFocus
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-collection-description">
                      Description
                    </FieldLabel>

                    <Textarea
                      {...field}
                      id="edit-collection-description"
                      placeholder="Complete notes for first semester"
                      maxLength={300}
                      rows={3}
                      aria-invalid={fieldState.invalid}
                      className="resize-none"
                    />

                    <FieldDescription>
                      Optional. Maximum 300 characters.
                    </FieldDescription>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="visibility"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="visibility-PUBLIC">
                      Visibility
                    </FieldLabel>

                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid gap-2 sm:grid-cols-2"
                    >
                      {COLLECTION_VISIBLITY.map((opt) => (
                        <label
                          key={opt}
                          htmlFor={`visibility-${opt}`}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                            "hover:bg-muted/40",
                            field.value === opt
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          )}
                        >
                          <RadioGroupItem
                            id={`visibility-${opt}`}
                            value={opt}
                            className="mt-0.5"
                          />

                          <span className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-2 text-sm font-medium capitalize">
                              <HugeiconsIcon
                                icon={
                                  opt === "PUBLIC" ? Globe02Icon : IncognitoIcon
                                }
                                size={16}
                                color="currentColor"
                                strokeWidth={2}
                                className="text-muted-foreground"
                              />
                              {opt.toLowerCase()}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              {opt === "PUBLIC"
                                ? "Anyone can view this collection"
                                : "Only you can see this collection"}
                            </span>
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  </Field>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => handleClose()}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="edit-collection-form"
                disabled={isPending || !form.formState.isDirty}
              >
                {isPending ? (
                  <>
                    <Spinner /> Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
