import Link from "next/link"
import { ComponentProps } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { IconSvgElement } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Route } from "next"
import {
  FileUploadIcon,
  Folder01Icon,
  FolderLibraryIcon,
  HeartIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { useSidebar } from "../ui/sidebar"

type ProfileCtaProps = {
  icon: IconSvgElement
  title: string
  description: string
  buttonLabel: string
  href: string
  className?: string
  iconClassName?: string
  buttonProps?: ComponentProps<typeof Button>
}

export function ProfileCta({
  icon,
  title,
  description,
  buttonLabel,
  href,
  className,
  iconClassName = "text-primary",
  buttonProps,
}: ProfileCtaProps) {
  const { open } = useSidebar()

  return (
    <section
      aria-labelledby="profile-cta-title"
      className={cn("mx-2 hidden pb-4", !open && "hidden", className)}
    >
      <div className="flex flex-col items-center rounded-lg bg-primary/10 p-4 text-center">
        <div className="mb-5 flex size-18 items-center justify-center rounded-xl bg-primary/15">
          <HugeiconsIcon
            icon={icon}
            size={38}
            color="currentColor"
            strokeWidth={2}
            className={iconClassName}
          />
        </div>

        <div className="max-w-sm">
          <h2
            id="profile-cta-title"
            className="text-base font-semibold tracking-tight"
          >
            {title}
          </h2>

          <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>

        <Button
          {...buttonProps}
          className="mt-5 w-full max-w-sm"
          nativeButton={false}
          render={<Link href={href as Route}>{buttonLabel}</Link>}
        />
      </div>
    </section>
  )
}

export function ParsedProfileCta({ pathname }: { pathname: string }) {
  if (pathname === "/profile/collections") {
    return (
      <ProfileCta
        icon={Folder01Icon}
        title="Organize Your Learning"
        description="Create collections to organize notes by subjects, courses, or any topic."
        buttonLabel="Create Collection"
        href="/profile/collections/new"
      />
    )
  }
  if (pathname === "/profile/notes") {
    return (
      <ProfileCta
        icon={Folder01Icon}
        title="Organize Your Notes"
        description="Group your notes into collections to find them faster."
        buttonLabel="Create Collection"
        href="/profile/collections/new"
      />
    )
  }
  if (pathname === "/profile/contributions") {
    return (
      <ProfileCta
        icon={FileUploadIcon}
        title="Share Your Knowledge"
        description="Have useful notes? Share them with students everywhere."
        buttonLabel="Share Your Notes"
        href="/contribution"
      />
    )
  }
  if (pathname === "/profile/saved-notes") {
    return (
      <ProfileCta
        icon={HeartIcon}
        title="Organize Your Saved Notes"
        description="Turn your saved notes into collections for easier study."
        buttonLabel="Create Collection"
        href="#"
      />
    )
  }
  if (pathname === "/profile/saved-collections") {
    return (
      <ProfileCta
        icon={FolderLibraryIcon}
        title="Discover More Collections"
        description="Explore collections created by students and teachers across OpenNotes."
        buttonLabel="Browse Collections"
        href="/profile/collections"
      />
    )
  }
  if (pathname === "/profile/dashboard" || pathname === "/profile/settings") {
    return (
      <ProfileCta
        icon={Folder01Icon}
        title="Organize Your Learning"
        description="Create collections to keep your notes organized by subject, course, or topic."
        buttonLabel="Create Collection"
        href="/profile/collections/new"
      />
    )
  }
}
