"use client"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

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
import { AtSignIcon } from "@hugeicons/core-free-icons"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

export function UpdateProfileDialog() {
  const { close, isOpen, type, data } = useModal()

  const isModalOpen = isOpen && type === "update-profile"

  const router = useRouter()

  const { profile } = data

  const form = useForm<UpdateProfileType>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
      username: "",
    },
  })

  const {
    formState: { isDirty, isLoading, isSubmitting },
  } = form

  const loading = isLoading || isSubmitting

  React.useEffect(() => {
    if (profile) {
      form.setValue("name", profile.name)
      form.setValue("bio", profile?.bio ?? "")
      form.setValue("username", profile.username)
    }
  }, [form, profile])

  async function onSubmit(data: UpdateProfileType) {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile.")
      }

      toast.success(result.message || "Profile updated successfully.")

      router.refresh()

      close()
    } catch (error) {
      console.error("[UpdateProfile]", error)

      toast.error(
        error instanceof Error ? error.message : "Unable to update profile."
      )
    }
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(openState) => {
        if (!openState) close()
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
              onClick={close}
              disabled={!isDirty || loading}
            >
              Cancel
            </Button>
            <Button
              disabled={!loading && !form.formState.isValid}
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
