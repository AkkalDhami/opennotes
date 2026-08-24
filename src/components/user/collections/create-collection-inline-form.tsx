"use client"

import { useTransition } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

import { createCollection } from "@/lib/user/collections"
import { CollectionNameSchema } from "@/validations/collection"

const InlineCreateCollectionSchema = z.object({
  name: CollectionNameSchema,
  parentId: z.uuid().or(z.literal("none")).nullable().optional(),
})

type InlineCreateCollectionInput = z.infer<typeof InlineCreateCollectionSchema>

interface CreateCollectionInlineFormProps {
  parentOptions: { id: string; name: string; depth: number }[]
  defaultParentId?: string | null
  onCreated: (collection: {
    id: string
    slug: string
    name: string
    parentId: string | null
  }) => void
  onCancel: () => void
}

export function CreateCollectionInlineForm({
  parentOptions,
  defaultParentId,
  onCreated,
  onCancel,
}: CreateCollectionInlineFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<InlineCreateCollectionInput>({
    resolver: zodResolver(InlineCreateCollectionSchema),
    defaultValues: {
      name: "",
      parentId: defaultParentId ?? "none",
    },
  })

  const parentId = useWatch({
    control: form.control,
    name: "parentId",
  })

  function handleSubmit(values: InlineCreateCollectionInput) {
    startTransition(async () => {
      const parentId =
        values.parentId === "none" ? null : (values.parentId ?? null)

      const result = await createCollection({
        name: values.name,
        description: "",
        parentId,
      })

      if (!result.ok) {
        toast.error(result.error || "Failed to create collection.")
        return
      }

      toast.success(`Collection "${values.name}" was created`)

      onCreated({
        id: result.data.id,
        slug: result.data.slug,
        name: values.name,
        parentId,
      })

      form.reset({ name: "", parentId: "none" })
    })
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-3 rounded-lg border border-border bg-muted/20 p-3"
    >
      <FieldGroup className="gap-3">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="inline-collection-name">
                Collection name
              </FieldLabel>
              <Input
                {...field}
                id="inline-collection-name"
                placeholder="Data Structures Revision"
                maxLength={120}
                autoFocus
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {parentOptions.length > 0 && (
          <Field>
            <FieldLabel htmlFor="inline-collection-parent">
              Parent collection
            </FieldLabel>
            <Select
              value={parentId || "none"}
              onValueChange={(value) =>
                form.setValue("parentId", value === "none" ? "none" : value, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="inline-collection-parent">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (top level)</SelectItem>
                {parentOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {"—".repeat(opt.depth)} {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner /> Creating...
            </>
          ) : (
            "Create"
          )}
        </Button>
      </div>
    </form>
  )
}
