"use client"

import { useCallback, useRef, useState } from "react"

// NOTE: verify these exact icon names against your installed `hugeicons-react`
// version — names occasionally change between releases. Swap for whatever
// PDF / upload / trash icons exist in your package.
import {
  Cancel01Icon,
  FileValidationIcon,
  PdfIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  ALLOWED_NOTE_FILE_MIME_TYPES,
  MAX_NOTE_FILE_SIZE,
  MAX_NOTE_FILE_SIZE_LABEL,
} from "@/constants/notes.constants"
import { HugeiconsIcon } from "@hugeicons/react"

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export type PdfUploadStatus = "idle" | "uploading" | "error"

interface PdfUploadProps {
  file: File | null
  onFileSelect: (file: File | null) => void
  status?: PdfUploadStatus
  progress?: number
  errorMessage?: string
  disabled?: boolean
}

export function PdfUpload({
  file,
  onFileSelect,
  status = "idle",
  progress = 0,
  errorMessage,
  disabled = false,
}: PdfUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndSelect = useCallback(
    (candidate: File | undefined | null) => {
      if (!candidate) return

      if (
        !(ALLOWED_NOTE_FILE_MIME_TYPES as readonly string[]).includes(
          candidate.type
        )
      ) {
        onFileSelect(null)
        return
      }
      if (candidate.size > MAX_NOTE_FILE_SIZE) {
        onFileSelect(null)
        return
      }

      onFileSelect(candidate)
    },
    [onFileSelect]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragActive(false)
      if (disabled) return
      validateAndSelect(event.dataTransfer.files?.[0])
    },
    [disabled, validateAndSelect]
  )

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSelect(event.target.files?.[0])
    // allow re-selecting the same file after removal
    event.target.value = ""
  }

  const openFileDialog = () => {
    if (!disabled) inputRef.current?.click()
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Choose PDF file"
        disabled={disabled}
      />

      {!file && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Drag and drop your PDF here, or activate to choose a file"
          onClick={openFileDialog}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              openFileDialog()
            }
          }}
          onDragOver={(event) => {
            event.preventDefault()
            if (!disabled) setIsDragActive(true)
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            isDragActive && "border-primary bg-accent",
            disabled && "pointer-events-none opacity-60"
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <HugeiconsIcon
              icon={PdfIcon}
              strokeWidth={2}
              className="size-6"
              aria-hidden="true"
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Drag &amp; drop your PDF here
            </p>
            <p className="text-sm text-muted-foreground">or</p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              openFileDialog()
            }}
            disabled={disabled}
          >
            <HugeiconsIcon
              icon={Upload04Icon}
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />
            Choose PDF
          </Button>

          <p className="text-xs text-muted-foreground">
            PDF only · Maximum {MAX_NOTE_FILE_SIZE_LABEL}
          </p>
        </div>
      )}

      {file && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <HugeiconsIcon
              icon={FileValidationIcon}
              strokeWidth={2}
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {file.name}
            </p>
            {status === "uploading" ? (
              <div className="mt-1.5 space-y-1">
                <Progress value={progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  Uploading... {progress}%
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </p>
            )}
          </div>

          {status !== "uploading" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFileSelect(null)}
              disabled={disabled}
              aria-label="Remove selected file"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={2}
                className="size-5"
                aria-hidden="true"
              />
              Remove
            </Button>
          )}
        </div>
      )}

      {status === "error" && errorMessage && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {errorMessage ||
            "Unable to upload this file. Please select a valid PDF."}
        </p>
      )}
    </div>
  )
}
