"use client"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "react-hot-toast"
import { useModal } from "@/hooks/use-modal-store"
import { UpdateProfileSchema, UpdateProfileType } from "@/validations/auth"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AtSignIcon,
  CameraIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/utils/get-initials"

export function UpdateProfileDialog() {
  const { close, isOpen, type, data } = useModal()

  const isModalOpen = isOpen && type === "update-profile"

  const router = useRouter()

  const { profile } = data

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Locally staged avatar selection — nothing here touches the server
  // until the form is actually submitted.
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const [avatarError, setAvatarError] = React.useState<string | null>(null)

  const form = useForm<UpdateProfileType>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
      username: "",
      avatarUrl: "",
    },
  })

  const {
    formState: { isDirty, isLoading, isSubmitting },
  } = form

  const loading = isLoading || isSubmitting
  const hasChanges = isDirty || Boolean(avatarFile)

  const [prevModalOpen, setPrevModalOpen] = React.useState(isModalOpen)

  if (isModalOpen !== prevModalOpen) {
    setPrevModalOpen(isModalOpen)
    if (isModalOpen) {
      resetAvatarSelection()
    }
  }

  React.useEffect(() => {
    if (profile) {
      form.setValue("name", profile.name)
      form.setValue("bio", profile?.bio ?? "")
      form.setValue("username", profile.username)
      form.setValue("avatarUrl", profile?.avatar ?? "")
    }
  }, [form, profile])

  // Clean up any local object URL when the component unmounts
  React.useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  function resetAvatarSelection() {
    setAvatarFile(null)
    setAvatarPreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
    setAvatarError(null)
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    setAvatarError(null)

    if (!file.type.startsWith("image/")) {
      setAvatarError("Only JPEG, PNG, WEBP, or GIF images are allowed")
      event.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 5MB")
      event.target.value = ""
      return
    }

    // Stage the file locally and show a preview — no upload happens yet.
    setAvatarPreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
    setAvatarFile(file)

    event.target.value = ""
  }

  function handleCancelAvatar() {
    resetAvatarSelection()
  }

  function handleDialogCancel() {
    resetAvatarSelection()
    close()
  }

  async function onSubmit(data: UpdateProfileType) {
    try {
      // Only upload now, at save time, if the user actually staged a new avatar.
      const formData = new FormData()
      if (avatarFile) {
        formData.append("avatarUrl", avatarFile)
      }

      formData.append("name", data.name)
      formData.append("bio", data.bio ?? "")
      formData.append("username", data.username)
      console.log({ e: process.env.NEXT_API_URL })
      const response = await fetch(`/api/auth/profile`, {
        method: "PATCH",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile.")
      }

      toast.success(result.message || "Profile updated successfully.")

      resetAvatarSelection()
      router.refresh()

      close()
    } catch (error) {
      console.error("[UpdateProfile]", error)

      toast.error(
        error instanceof Error ? error.message : "Unable to update profile."
      )
    }
  }

  const savedAvatarUrl = useWatch({
    control: form.control,
    name: "avatarUrl",
  })

  // Local preview takes priority (unsaved selection); otherwise fall back
  // to whatever avatar is currently saved on the profile.
  const avatarSrc = avatarPreview || savedAvatarUrl || undefined

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(openState) => {
        if (!openState) handleDialogCancel()
      }}
    >
      <form>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className={"text-lg font-medium"}>
              Edit your profile
            </DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&lsquo;re
              done.
            </DialogDescription>
          </DialogHeader>
          <form id="update-profile" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col items-center gap-3 pb-4">
              <div className="relative">
                <Avatar className="size-20 border border-border">
                  <AvatarImage
                    src={avatarSrc}
                    alt={profile?.name ? `${profile.name}'s avatar` : "Avatar"}
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials(profile?.name ?? "")}
                  </AvatarFallback>
                </Avatar>

                {avatarFile && (
                  <button
                    type="button"
                    onClick={handleCancelAvatar}
                    disabled={loading}
                    aria-label="Cancel avatar change"
                    className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground disabled:cursor-not-allowed"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={14}
                      color="currentColor"
                      strokeWidth={2}
                    />
                  </button>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <HugeiconsIcon
                  icon={CameraIcon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                />
                Change Avatar
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              {avatarError && (
                <p className="text-xs text-destructive">{avatarError}</p>
              )}
            </div>

            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Your name"
                      autoFocus
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id="username"
                        aria-invalid={fieldState.invalid}
                        placeholder="Your username"
                        autoComplete="off"
                      />
                      <InputGroupAddon align="inline-start">
                        <HugeiconsIcon
                          icon={AtSignIcon}
                          size={24}
                          color="currentColor"
                          strokeWidth={2}
                        />
                      </InputGroupAddon>
                    </InputGroup>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="bio"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="bio">Bio</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="bio"
                        placeholder="Write a few sentences about yourself"
                        rows={6}
                        className="min-h-28 resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field?.value?.length}/220 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDialogCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              disabled={!hasChanges || (!loading && !form.formState.isValid)}
              type="submit"
              form="update-profile"
            >
              {loading ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
