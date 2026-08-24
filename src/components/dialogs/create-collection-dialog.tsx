"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
      parentId: fixedParentId ?? "none",
      visibility: "PRIVATE",
    },
  })

  const title = fixedParentId ? "Create subcollection" : "Create collection"

  if (fixedParentId) {
    form.setValue("parentId", fixedParentId)
  }

  const parentId = useWatch({
    control: form.control,
    name: "parentId",
  })

  function handleClose() {
    close()
    form.reset({
      name: "",
      description: "",
      parentId: null,
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
                {fixedParentName
                  ? `This will be nested under "${fixedParentName}".`
                  : "Group related notes together — you can nest collections later."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-4">
              {/* Description */}

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Name <span className="text-destructive">*</span>
                    </FieldLabel>

                    <Input
                      {...field}
                      id="collection-name"
                      placeholder="BCA 1st Semester"
                      maxLength={120}
                      autoFocus
                      aria-invalid={fieldState.invalid}
                      {...form.register("name")}
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
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Description
                    </FieldLabel>

                    <Textarea
                      {...field}
                      id="collection-description"
                      placeholder="Complete notes for first semester"
                      maxLength={500}
                      rows={3}
                      aria-invalid={fieldState.invalid}
                      {...form.register("description")}
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

              {!fixedParentId && parentOptions && parentOptions?.length > 0 && (
                <Field data-invalid={!!form.formState.errors.parentId}>
                  <FieldLabel htmlFor="collection-parent">
                    Parent collection
                  </FieldLabel>

                  <Select
                    value={parentId || "none"}
                    onValueChange={(value) => {
                      form.setValue("parentId", value === "none" ? "" : value, {
                        shouldValidate: true,
                      })
                    }}
                  >
                    <SelectTrigger
                      id="collection-parent"
                      aria-invalid={!!form.formState.errors.parentId}
                    >
                      <SelectValue placeholder="None" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>

                      {parentOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {form.formState.errors.parentId && (
                    <FieldError>
                      {form.formState.errors.parentId.message}
                    </FieldError>
                  )}
                </Field>
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
