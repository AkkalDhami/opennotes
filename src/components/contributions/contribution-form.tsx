"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

import {
  PdfUpload,
  PdfUploadStatus,
} from "@/components/contributions/pdf-upload"
import { SearchSelect } from "@/components/shared/search-select"

import {
  contributionFormSchema,
  ContributionFormValues,
} from "@/validations/contribution"
import {
  COURSE_LEVELS,
  EDUCATIONAL_LEVELS,
  GRADES,
  NOTE_DESCRIPTION_MAX_LENGTH,
  NOTES_CATEGORIES,
  SUBJECTS,
} from "@/constants/notes.constants"
import { handleConfetti } from "@/components/ui/confetti"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

interface ApiResponse {
  success: boolean
  message: string
  data?: {
    id: string
    status: string
  }
}

export function ContributionForm() {
  const router = useRouter()
  const [uploadStatus, setUploadStatus] = useState<PdfUploadStatus>("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      category: "",
      educationLevel: "",
      grade: "",
      topic: "",
      course: "",
      academicYear: "",
      file: undefined as unknown as File,
      tags: "",
    },
  })

  const descriptionValue = useWatch({
    control: form.control,
    name: "description",
  })
  const fileValue = useWatch({
    control: form.control,
    name: "file",
  })
  const educationLevel = useWatch({
    control: form.control,
    name: "educationLevel",
  })
  const handleFileSelect = (file: File | null) => {
    setUploadError(undefined)
    setUploadStatus("idle")
    form.setValue("file", file as unknown as File, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const filteredPrograms = COURSE_LEVELS.filter(
    (program) => program.level === educationLevel
  )

  const gradeOptions = GRADES.filter(
    (grade) => grade.level === educationLevel || ""
  )

  const onSubmit = async (values: ContributionFormValues) => {
    if (isSubmitting) return // guard against double submission
    setIsSubmitting(true)
    setUploadStatus("uploading")
    setUploadProgress(0)
    setUploadError(undefined)

    try {
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("description", values.description ?? "")
      formData.append("subject", values.subject)
      formData.append("category", values.category ?? "")
      formData.append("educationLevel", values.educationLevel ?? "")
      formData.append("course", values.course)
      formData.append("grade", values.grade ?? "")
      formData.append("topic", values.topic ?? "")
      formData.append("academicYear", values.academicYear ?? "")
      formData.append("file", values.file)
      formData.append("tags", values.tags ?? "")

      const result = await submitWithProgress(formData, setUploadProgress)
      console.log({ result })
      if (!result.success) {
        setUploadStatus("error")
        setUploadError(result.message)
        toast.error(
          result.message || "Unable to submit your note. Please try again."
        )
        return
      }

      setUploadStatus("idle")
      toast.success("Your note has been submitted for review.")
      handleConfetti()
      form.reset()
      router.push("/")
    } catch (error) {
      console.error("[ContributionForm] submission failed:", error)
      setUploadStatus("error")
      setUploadError("Unable to submit your note. Please try again.")
      toast.error(
        (error as Error).message ||
          "Unable to submit your note. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <Card className="bg-background">
        <CardHeader>
          <CardTitle>Note Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="note-title">
                    Title <span className="text-destructive">*</span>
                  </FieldLabel>

                  <Input
                    {...field}
                    id="note-title"
                    placeholder="Physics Chapter 3 — Electromagnetic Induction"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="subject"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="subject">
                    Subject <span className="text-destructive">*</span>
                  </FieldLabel>

                  <SearchSelect
                    options={SUBJECTS}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    placeholder="Select subject"
                    searchPlaceholder="Search subjects..."
                    emptyMessage="No subject found."
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="category"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Category <span className="text-destructive">*</span>
                  </FieldLabel>

                  <SearchSelect
                    options={NOTES_CATEGORIES}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    placeholder="Select category"
                    searchPlaceholder="Search categories..."
                    emptyMessage="No category found."
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="note-description">Description</FieldLabel>

                <Textarea
                  {...field}
                  id="note-description"
                  placeholder="Briefly describe what these notes cover..."
                  disabled={isSubmitting}
                  rows={4}
                  aria-invalid={fieldState.invalid}
                />

                <div className="flex items-center justify-between">
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <span />
                  )}

                  <span className="text-xs text-muted-foreground">
                    {descriptionValue?.length} / {NOTE_DESCRIPTION_MAX_LENGTH}
                  </span>
                </div>
              </Field>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-4">
            <Controller
              name="educationLevel"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Education Level <span className="text-destructive">*</span>
                  </FieldLabel>

                  <SearchSelect
                    options={EDUCATIONAL_LEVELS}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    placeholder="Select education level"
                    searchPlaceholder="Search education level..."
                    emptyMessage="No education level found."
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="course"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Course/Program <span className="text-destructive">*</span>
                  </FieldLabel>

                  <SearchSelect
                    options={filteredPrograms}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    placeholder="Select course/program"
                    searchPlaceholder="Search course/program..."
                    emptyMessage="No course/program found."
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="grade"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Grade <span className="text-destructive">*</span>
                  </FieldLabel>

                  <SearchSelect
                    options={gradeOptions}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Select grade or year"
                    searchPlaceholder="Search grade..."
                    emptyMessage="No grade found."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="topic"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Topic</FieldLabel>

                  <Input
                    {...field}
                    placeholder="e.g. Electromagnetic Induction"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <Controller
              name="academicYear"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="">
                  <FieldLabel>Academic Year</FieldLabel>

                  <Input
                    {...field}
                    placeholder="eg. 2083-2084"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="tags"

              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="sm:col-span-2"
                >
                  <FieldLabel>Tags(Comma separated)</FieldLabel>

                  <Input
                    {...field}
                    placeholder="eg. electromagnetic induction, physics, electromagnetism"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle>
            Upload your PDF <span className="text-destructive">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="file"
            control={form.control}
            render={({ fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <PdfUpload
                  file={fileValue ?? null}
                  onFileSelect={handleFileSelect}
                  status={uploadStatus}
                  progress={uploadProgress}
                  errorMessage={uploadError}
                  disabled={isSubmitting}
                />

                <FieldDescription>
                  Every submission is reviewed before being published.
                </FieldDescription>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        ✓ Your submission will be reviewed before publication.
      </p>

      <div className="border-t pt-5">
        <h4 className="mb-3 text-sm font-semibold">Before you submit</h4>

        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-4 shrink-0"
              strokeWidth={2}
            />
            Title and description accurately describe the note.
          </li>

          <li className="flex items-start gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-4 shrink-0"
              strokeWidth={2}
            />
            Subject, course, and grade are correctly selected.
          </li>

          <li className="flex items-start gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-4 shrink-0"
              strokeWidth={2}
            />
            The uploaded file is readable and complete.
          </li>

          <li className="flex items-start gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-4 shrink-0"
              strokeWidth={2}
            />
            The content does not violate copyright or other rights.
          </li>
        </ul>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.push("/")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Note"}
        </Button>
      </div>
    </form>
  )
}

function submitWithProgress(
  formData: FormData,
  onProgress: (percent: number) => void
): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/notes")

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      // console.log("STATUS:", xhr.status)
      // console.log("STATUS TEXT:", xhr.statusText)
      // console.log("CONTENT TYPE:", xhr.getResponseHeader("content-type"))
      // console.log("RESPONSE:", JSON.stringify(xhr.responseText))

      if (!xhr.responseText) {
        reject(new Error(`Empty response from server. HTTP ${xhr.status}`))
        return
      }

      try {
        const json = JSON.parse(xhr.responseText) as ApiResponse

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(json)
        } else {
          reject(
            new Error(
              json.message || `Request failed with status ${xhr.status}`
            )
          )
        }
      } catch (error) {
        console.error("JSON parse failed:", error)

        reject(
          new Error(`Invalid JSON response from server. HTTP ${xhr.status}`)
        )
      }
    }

    xhr.onerror = () => reject(new Error("Network error while submitting."))
    xhr.send(formData)
  })
}
