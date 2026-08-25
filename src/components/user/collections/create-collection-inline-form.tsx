"use client"

import { useMemo, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
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
import { Spinner } from "@/components/ui/spinner"

import { createCollection } from "@/lib/user/collections"
import { CollectionNameSchema } from "@/validations/collection"
import { CollectionParentPicker } from "@/components/user/collections/collection-parent-picker"
import { buildTreeFromDepthList } from "@/lib/user/collection-option-tree"

const InlineCreateCollectionSchema = z.object({
  name: CollectionNameSchema,
  parentId: z.uuid().nullable().optional(),
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
      parentId: defaultParentId ?? null,
    },
  })

  // The caller hands us an already-flattened depth list; rebuild the nesting so
  // the picker can render it as a tree.
  const parentTree = useMemo(
    () => buildTreeFromDepthList(parentOptions),
    [parentOptions]
  )

  function handleSubmit(values: InlineCreateCollectionInput) {
    startTransition(async () => {
      const parentId = values.parentId ?? null

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

      form.reset({ name: "", parentId: null })
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

        {parentTree.length > 0 && (
          <Controller
            name="parentId"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="inline-collection-parent">
                  Parent collection
                </FieldLabel>
                <CollectionParentPicker
                  id="inline-collection-parent"
                  nodes={parentTree}
                  value={field.value ?? null}
                  onChange={(parentId) => field.onChange(parentId)}
                />
              </Field>
            )}
          />
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
