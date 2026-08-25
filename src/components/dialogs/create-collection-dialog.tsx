"use client"

import { useEffect, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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

import { createCollection } from "@/lib/user/collections"
import {
  CreateCollectionInput,
  CreateCollectionSchema,
} from "@/validations/collection"
import { useModal } from "@/hooks/use-modal-store"
import { Spinner } from "@/components/ui/spinner"
import { COLLECTION_VISIBLITY } from "@/db"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Globe02Icon, IncognitoIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { CollectionParentPicker } from "@/components/user/collections/collection-parent-picker"
import { buildOptionTree } from "@/lib/user/collection-option-tree"

export function CreateCollectionDialog() {
  const router = useRouter()
  const { close, isOpen, type, data } = useModal()

  const isModalOpen = isOpen && type === "create-collection"
  const [isPending, startTransition] = useTransition()

  const { collectionFormDialog } = data

  const { collection, fixedParentId, fixedParentName, parentOptions } =
    collectionFormDialog ?? {}

  const form = useForm<CreateCollectionInput>({
    resolver: zodResolver(CreateCollectionSchema),
    defaultValues: {
      name: collection?.name ?? "",
      description: collection?.description ?? "",
      parentId: fixedParentId ?? null,
      visibility: "PRIVATE",
    },
  })

  const title = fixedParentId ? "Create subcollection" : "Create collection"

  // Reset on open rather than calling setValue during render: the previous
  // version wrote to form state on every render, which fights React and left
  // stale values behind when the dialog was reopened for a different parent.
  useEffect(() => {
    if (!isModalOpen) return
    form.reset({
      name: "",
      description: "",
      parentId: fixedParentId ?? null,
      visibility: "PRIVATE",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, fixedParentId])

  const parentTree = useMemo(
    () => buildOptionTree(parentOptions ?? []),
    [parentOptions]
  )

  function handleClose() {
    close()
    form.reset({
      name: "",
      description: "",
      parentId: null,
      visibility: "PRIVATE",
    })
  }

  function handleSubmit(values: CreateCollectionInput) {
    startTransition(async () => {
      const result = await createCollection({
        name: values.name,
        description: values.description,
        parentId: values.parentId === "none" ? null : values.parentId,
        visibility: values.visibility,
      })

      if (!result.ok) {
        toast.error(result.error || "Failed to create collection.")
        return
      }

      toast.success(`Collection "${values.name}" was created successfully`)

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
          id="create-collection-form"
        >
          <FieldGroup>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>

              <DialogDescription>
                {fixedParentName ? (
                  <>
                    This will be nested under{" "}
                    <strong className="font-medium text-foreground">
                      {fixedParentName}
                    </strong>
                    .
                  </>
                ) : (
                  "Group related notes together — you can nest collections later."
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid max-h-[60vh] gap-4 overflow-y-auto px-2">
              {/* Description */}

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="collection-name">
                      Name <span className="text-destructive">*</span>
                    </FieldLabel>

                    <Input
                      {...field}
                      id="collection-name"
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
                    <FieldLabel htmlFor="collection-description">
                      Description
                    </FieldLabel>

                    <Textarea
                      {...field}
                      id="collection-description"
                      placeholder="Complete notes for first semester"
                      maxLength={500}
                      rows={3}
                      aria-invalid={fieldState.invalid}
                      className="resize-none"
                    />

                    <FieldDescription>
                      Optional. Maximum 500 characters.
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

              {!fixedParentId && parentTree.length > 0 && (
                <Controller
                  name="parentId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="collection-parent">
                        Parent collection
                      </FieldLabel>

                      <CollectionParentPicker
                        id="collection-parent"
                        nodes={parentTree}
                        value={
                          field.value && field.value !== "none"
                            ? field.value
                            : null
                        }
                        onChange={(parentId) => field.onChange(parentId)}
                      />

                      <FieldDescription>
                        Optional. Pick a collection to nest this one inside.
                      </FieldDescription>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}
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
                form="create-collection-form"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Spinner /> Creating...
                  </>
                ) : (
                  "Create Collection"
                )}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// export function CreateCollectionTrigger({
//   children,
//   parentOptions = [],
// }: {
//   children: ReactNode
//   parentOptions?: CollectionParentOption[]
// }) {
//   const [open, setOpen] = useState(false)

//   return (
//     <>
//       <span onClick={() => setOpen(true)} className="cursor-pointer">
//         {children}
//       </span>

//       <CollectionFormDialog
//         open={open}
//         onOpenChange={setOpen}
//         mode="create"
//         parentOptions={parentOptions}
//       />
//     </>
//   )
// }
