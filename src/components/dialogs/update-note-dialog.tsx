/* eslint-disable react-hooks/incompatible-library */
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "react-hot-toast"

import {
  Add01Icon,
  Alert02Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"

import { Textarea } from "@/components/ui/textarea"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Badge } from "@/components/ui/badge"

import { UpdateNoteSchema, UpdateNoteFormValues } from "@/validations/note"

import { NoteStatus } from "@/db"
import {
  COURSE_LEVELS,
  EDUCATIONAL_LEVELS,
  GRADES,
  NOTES_CATEGORIES,
  SUBJECTS,
} from "@/constants/notes.constants"
import { SearchSelect } from "../shared/search-select"
import { useModal } from "@/hooks/use-modal-store"

const STATUS_OPTIONS: {
  value: NoteStatus
  label: string
}[] = [
  {
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "PENDING_REVIEW",
    label: "Pending Review",
  },
  {
    value: "PUBLISHED",
    label: "Published",
  },
  {
    value: "REJECTED",
    label: "Rejected",
  },
  {
    value: "REMOVED",
    label: "Removed",
  },
]

export function UpdateNoteDialog() {
  const { close, isOpen, type, data } = useModal()

  const isModalOpen = isOpen && type === "update-note"

  const router = useRouter()

  const [tagInput, setTagInput] = useState("")
  const { note } = data
  const form = useForm<
    z.input<typeof UpdateNoteSchema>,
    unknown,
    UpdateNoteFormValues
  >({
    resolver: zodResolver(UpdateNoteSchema),
    defaultValues: {
      title: note?.title ?? "",
      description: note?.description ?? "",
      subject: note?.subject ?? "",
      category: note?.category ?? "",
      educationLevel: note?.educationLevel ?? "",
      course: note?.course ?? "",
      grade: note?.grade ?? "",
      topic: note?.topic ?? "",
      academicYear: note?.academicYear ?? "",
      tags: note?.tags ?? [],
      status: note?.status,
      rejectionReason: "",
    },
  })

  const educationLevel = form.watch("educationLevel")
  const status = form.watch("status")
  const tags = form.watch("tags") ?? []

  const filteredPrograms = useMemo(() => {
    if (!educationLevel) return []

    return COURSE_LEVELS.filter((program) => program.level === educationLevel)
  }, [educationLevel])

  const filteredGrades = useMemo(() => {
    if (!educationLevel) return []

    return GRADES.filter((grade) => grade.level === educationLevel)
  }, [educationLevel])

  useEffect(() => {
    const currentCourse = form.getValues("course")
    const currentGrade = form.getValues("grade")

    if (
      currentCourse &&
      filteredPrograms.length > 0 &&
      !filteredPrograms.some((program) => program.id === currentCourse)
    ) {
      form.setValue("course", "")
    }

    if (
      currentGrade &&
      filteredGrades.length > 0 &&
      !filteredGrades.some((grade) => grade.id === currentGrade)
    ) {
      form.setValue("grade", "")
    }
  }, [educationLevel, filteredPrograms, filteredGrades, form])

  useEffect(() => {
    if (status !== "REJECTED") {
      form.setValue("rejectionReason", "")
    }
  }, [status, form])

  function addTag() {
    const value = tagInput.trim()

    if (!value) return

    const exists = tags.some((tag) => tag.toLowerCase() === value.toLowerCase())

    if (exists) {
      toast.error("This tag already exists.")
      return
    }

    if (tags.length >= 20) {
      toast.error("You can add up to 20 tags.")
      return
    }

    form.setValue("tags", [...tags, value], {
      shouldDirty: true,
      shouldValidate: true,
    })

    setTagInput("")
  }

  function removeTag(tag: string) {
    form.setValue(
      "tags",
      tags.filter((item) => item !== tag),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    )
  }

  function handleTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addTag()
    }
  }

  async function onSubmit(values: UpdateNoteFormValues) {
    try {
      const response = await fetch(`/api/admin/notes/${note?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update note.")
      }

      toast.success("Note updated successfully.")

      close()

      router.refresh()
    } catch (error) {
      console.error("[UpdateNoteDialog]", error)

      toast.error(
        error instanceof Error ? error.message : "Failed to update note."
      )
    }
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(openState) => {
        if (!openState) close()
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Update Note</DialogTitle>

          <DialogDescription>
            Update the metadata and publication status of this note.
          </DialogDescription>

          <div className="mt-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <span className="font-medium">Current note:</span> {note?.title}
          </div>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex min-h-0 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <FieldSet>
              <FieldLegend>Note Information</FieldLegend>

              <div className="grid gap-5">
                {/* Title */}
                <Field data-invalid={!!form.formState.errors.title}>
                  <FieldLabel htmlFor="note-title">Title</FieldLabel>

                  <FieldContent>
                    <Input
                      id="note-title"
                      placeholder="Enter note title"
                      disabled={isSubmitting}
                      {...form.register("title")}
                    />

                    <FieldError errors={[form.formState.errors.title]} />
                  </FieldContent>
                </Field>

                {/* Description */}
                <Field data-invalid={!!form.formState.errors.description}>
                  <FieldLabel htmlFor="note-description">
                    Description
                  </FieldLabel>

                  <FieldContent>
                    <Textarea
                      id="note-description"
                      placeholder="Describe what this note contains..."
                      rows={4}
                      className="resize-none"
                      disabled={isSubmitting}
                      {...form.register("description")}
                    />

                    <FieldError errors={[form.formState.errors.description]} />
                  </FieldContent>
                </Field>

                {/* Subject + Category */}
                <div className="grid gap-5 md:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.subject}>
                    <FieldLabel>Subject</FieldLabel>

                    <FieldContent>
                      <SearchSelect
                        options={SUBJECTS}
                        value={form.watch("subject")}
                        onChange={(value) =>
                          form.setValue("subject", value as string, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        disabled={isSubmitting}
                        placeholder="Select subject"
                      />

                      <FieldError errors={[form.formState.errors.subject]} />
                    </FieldContent>
                  </Field>

                  <Field data-invalid={!!form.formState.errors.category}>
                    <FieldLabel>Category</FieldLabel>

                    <FieldContent>
                      <SearchSelect
                        options={NOTES_CATEGORIES}
                        value={form.watch("category")}
                        onChange={(value) =>
                          form.setValue("category", value as string, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        disabled={isSubmitting}
                        placeholder="Select category"
                      />

                      <FieldError errors={[form.formState.errors.category]} />
                    </FieldContent>
                  </Field>
                </div>
              </div>
            </FieldSet>

            <FieldSet className="mt-8">
              <FieldLegend>Academic Information</FieldLegend>

              <div className="grid gap-5">
                {/* Education level */}
                <Field data-invalid={!!form.formState.errors.educationLevel}>
                  <FieldLabel>Educational Level</FieldLabel>

                  <FieldContent>
                    <SearchSelect
                      options={EDUCATIONAL_LEVELS}
                      value={form.watch("educationLevel")}
                      onChange={(value) =>
                        form.setValue("educationLevel", value as string, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      disabled={isSubmitting}
                      placeholder="Select educational level"
                    />

                    <FieldError
                      errors={[form.formState.errors.educationLevel]}
                    />
                  </FieldContent>
                </Field>

                {/* Course + Grade */}
                <div className="grid gap-5 md:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.course}>
                    <FieldLabel>Course</FieldLabel>

                    <FieldContent>
                      <SearchSelect
                        options={
                          filteredPrograms.length
                            ? filteredPrograms
                            : [
                                {
                                  id: "Unknown",
                                  name: "Unknown / Not Applicable",
                                },
                              ]
                        }
                        value={form.watch("course") ?? ""}
                        onChange={(value) =>
                          form.setValue("course", value as string, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        disabled={isSubmitting || !educationLevel}
                        placeholder={
                          educationLevel
                            ? "Select course"
                            : "Select level first"
                        }
                      />

                      <FieldError errors={[form.formState.errors.course]} />
                    </FieldContent>
                  </Field>

                  <Field data-invalid={!!form.formState.errors.grade}>
                    <FieldLabel>Grade / Year</FieldLabel>

                    <FieldContent>
                      <SearchSelect
                        options={filteredGrades}
                        value={form.watch("grade")}
                        onChange={(value) =>
                          form.setValue("grade", value as string, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        disabled={isSubmitting || !educationLevel}
                        placeholder={
                          educationLevel
                            ? "Select grade / year"
                            : "Select level first"
                        }
                      />

                      <FieldError errors={[form.formState.errors.grade]} />
                    </FieldContent>
                  </Field>
                </div>

                {/* Topic + Academic Year */}
                <div className="grid gap-5 md:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.topic}>
                    <FieldLabel htmlFor="note-topic">Topic</FieldLabel>

                    <FieldContent>
                      <Input
                        id="note-topic"
                        placeholder="e.g. Database Normalization"
                        disabled={isSubmitting}
                        {...form.register("topic")}
                      />

                      <FieldError errors={[form.formState.errors.topic]} />
                    </FieldContent>
                  </Field>

                  <Field data-invalid={!!form.formState.errors.academicYear}>
                    <FieldLabel htmlFor="note-year">Academic Year</FieldLabel>

                    <FieldContent>
                      <Input
                        id="note-year"
                        placeholder="e.g. 2082/83"
                        disabled={isSubmitting}
                        {...form.register("academicYear")}
                      />

                      <FieldError
                        errors={[form.formState.errors.academicYear]}
                      />
                    </FieldContent>
                  </Field>
                </div>
              </div>
            </FieldSet>

            <FieldSet className="mt-8">
              <FieldLegend>Tags</FieldLegend>

              <FieldDescription>
                Add keywords to make this note easier to discover.
              </FieldDescription>

              <Field>
                <FieldContent>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      disabled={isSubmitting}
                      placeholder="Type a tag and press Enter"
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={handleTagKeyDown}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addTag}
                      disabled={isSubmitting || !tagInput.trim()}
                    >
                      <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                    </Button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}

                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => removeTag(tag)}
                            className="rounded-full hover:bg-muted"
                          >
                            <HugeiconsIcon
                              icon={Cancel01Icon}
                              size={13}
                              strokeWidth={2}
                            />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <FieldError errors={[form.formState.errors.tags]} />
                </FieldContent>
              </Field>
            </FieldSet>

            <FieldSet className="mt-8">
              <FieldLegend>Publication</FieldLegend>

              <div className="grid gap-5">
                <Field data-invalid={!!form.formState.errors.status}>
                  <FieldLabel>Status</FieldLabel>

                  <FieldContent>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        form.setValue("status", value as NoteStatus, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent>
                        {STATUS_OPTIONS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldError errors={[form.formState.errors.status]} />
                  </FieldContent>
                </Field>

                {status === "REJECTED" && (
                  <Field data-invalid={!!form.formState.errors.rejectionReason}>
                    <FieldLabel htmlFor="rejection-reason">
                      Rejection Reason
                    </FieldLabel>

                    <FieldContent>
                      <Textarea
                        id="rejection-reason"
                        rows={4}
                        className="resize-none"
                        placeholder="Explain why this note is being rejected..."
                        disabled={isSubmitting}
                        {...form.register("rejectionReason")}
                      />

                      <FieldError
                        errors={[form.formState.errors.rejectionReason]}
                      />
                    </FieldContent>
                  </Field>
                )}

                {status === "PUBLISHED" && (
                  <div className="flex gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      className="mt-0.5 shrink-0 text-green-600"
                      size={20}
                      strokeWidth={2}
                    />

                    <div className="text-sm">
                      <p className="font-medium">Ready to publish</p>

                      <p className="mt-1 text-muted-foreground">
                        Students will be able to view and download this note.
                      </p>
                    </div>
                  </div>
                )}

                {status === "REMOVED" && (
                  <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <HugeiconsIcon
                      icon={Alert02Icon}
                      className="mt-0.5 shrink-0 text-destructive"
                      size={20}
                      strokeWidth={2}
                    />

                    <div className="text-sm">
                      <p className="font-medium">Note will be removed</p>

                      <p className="mt-1 text-muted-foreground">
                        This note will no longer be available as published
                        content.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </FieldSet>
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="mr-2 animate-spin"
                    size={16}
                    strokeWidth={2}
                  />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
