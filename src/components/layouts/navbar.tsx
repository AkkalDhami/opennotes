import { APP_NAME } from "@/constants/app.constants"
import { Menu01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { ThemeToggle } from "../shared/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import { CommandMenu } from "../search/search-box"
import { Route } from "next"
import { UserAvatar } from "../admin/users/user-avatar"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { cn } from "@/lib/utils"

const links = [
  { href: "/notes", label: "Notes" },
  // { href: "/subjects", label: "Subjects" },
  { href: "/contributors", label: "Contributors" },
]

export async function Navbar() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 border-b bg-background backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 border-x px-4">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <span className="text-xl text-brand">{APP_NAME}</span>
          {/* <HugeiconsIcon
              icon={Books01Icon}
              size={24}
              color="currentColor"
              strokeWidth={1.5}
              className="size-4"
            /> */}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href as Route}
              className="text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden max-w-xs flex-1 items-center md:flex">
          <CommandMenu />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/contribution"
            className={cn(
              buttonVariants({
                variant: "ghost",
              }),
              "hidden rounded-full px-4 hover:bg-muted md:flex"
            )}
          >
            Share Your Notes
          </Link>

          {user?.id ? (
            <UserAvatar avatarUrl={user.avatar ?? ""} name={user?.name ?? ""} />
          ) : (
            <Link
              href="/signin"
              className={cn(
                buttonVariants({
                  variant: "brand",
                }),
                "hidden rounded-full px-4 md:flex"
              )}
            >
              Login
            </Link>
          )}

          <ThemeToggle />

          <Button
            variant={"outline"}
            className="rounded-full px-2 hover:bg-muted md:hidden"
          >
            <HugeiconsIcon
              icon={Search01Icon}
              size={24}
              color="currentColor"
              strokeWidth={1.5}
              className="size-4"
            />
          </Button>

          <button
            aria-label="Menu"
            className="rounded-full p-2 hover:bg-muted md:hidden"
          >
            <HugeiconsIcon
              icon={Menu01Icon}
              size={24}
              color="currentColor"
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>
    </header>
  )
}
