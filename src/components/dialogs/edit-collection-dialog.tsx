"use client"

import { useState, useTransition, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
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
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createCollection, updateCollection } from "@/lib/user/collections"
import {
  CreateCollectionInput,
  CreateCollectionSchema,
} from "@/validations/collection"
import { useModal } from "@/hooks/use-modal-store"

export function CollectionFormDialog() {
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
    },
  })

  const title =
    mode === "edit"
      ? "Edit collection"
      : fixedParentId
        ? "Create subcollection"
        : "Create collection"

  const parentId = useWatch({
    control: form.control,
    name: "parentId",
  })

  function handleSubmit(values: CreateCollectionInput) {
    startTransition(async () => {
      const result =
        mode === "edit" && collection
          ? await updateCollection({
              id: collection.id,
              name: values.name,
              description: values.description,
            })
          : await createCollection({
              name: values.name,
              description: values.description,
              parentId: values.parentId === "none" ? null : values.parentId,
            })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success(
        mode === "edit" ? "Collection updated" : "Collection created"
      )

      onOpenChange(false)

      if (mode === "create") {
        form.reset({
          name: "",
          description: "",
          parentId: fixedParentId ?? "none",
        })
      }

      router.refresh()
    })
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(openState) => {
        if (!openState) close()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>

            <DialogDescription>
              {fixedParentName
                ? `This will be nested under "${fixedParentName}".`
                : "Group related notes together — you can nest collections later."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Name */}
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="collection-name">Name</FieldLabel>

              <Input
                id="collection-name"
                placeholder="BCA 1st Semester"
                maxLength={120}
                autoFocus
                aria-invalid={!!form.formState.errors.name}
                {...form.register("name")}
              />

              {form.formState.errors.name && (
                <FieldError>{form.formState.errors.name.message}</FieldError>
              )}
            </Field>

            {/* Description */}
            <Field data-invalid={!!form.formState.errors.description}>
              <FieldLabel htmlFor="collection-description">
                Description
              </FieldLabel>

              <Textarea
                id="collection-description"
                placeholder="Complete notes for first semester"
                maxLength={500}
                rows={3}
                aria-invalid={!!form.formState.errors.description}
                {...form.register("description")}
                className="resize-none"
              />

              <FieldDescription>
                Optional. Maximum 500 characters.
              </FieldDescription>

              {form.formState.errors.description && (
                <FieldError>
                  {form.formState.errors.description.message}
                </FieldError>
              )}
            </Field>

            {/* Parent */}
            {mode === "create" && !fixedParentId && parentOptions.length > 0 ? (
              <Field data-invalid={!!form.formState.errors.parentId}>
                <FieldLabel htmlFor="collection-parent">
                  Parent collection
                </FieldLabel>

                <Select
                  value={parentId}
                  onValueChange={(value) =>
                    form.setValue("parentId", value ?? "", {
                      shouldValidate: true,
                    })
                  }
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
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : mode === "edit"
                  ? "Save changes"
                  : "Create Collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Uncontrolled wrapper used for the page-level
 * "+ Create Collection" button.
 */
export function CreateCollectionTrigger({
  children,
  parentOptions = [],
}: {
  children: ReactNode
  parentOptions?: ParentOption[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </span>

      <CollectionFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
        parentOptions={parentOptions}
      />
    </>
  )
}
