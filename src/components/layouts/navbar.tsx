import { Menu01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { Route } from "next"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { cn } from "@/lib/utils"
import { UserMenu } from "./user-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/shared/logo"
const links = [
  { href: "/notes", label: "Notes" },
  { href: "/contributors", label: "Contributors" },
  { href: "/settings", label: "Settings" },
]

export async function Navbar() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 border-t border-b bg-background pt-0.5 backdrop-blur">
      <div className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 border-x px-4">
        <div className="flex items-center gap-6">
          <Logo />

          <nav className="hidden items-center gap-6 font-medium md:flex">
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
        </div>

        {/* <div className="hidden max-w-xs flex-1 items-center md:flex">
          <CommandMenu />
        </div> */}

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
            <UserMenu user={user} />
          ) : (
            <Link
              href="/signin"
              className={cn(
                buttonVariants({
                  variant: "default",
                }),
                "hidden rounded-full px-4 md:flex"
              )}
            >
              Login
            </Link>
          )}

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
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
              }
            ></DropdownMenuTrigger>
            <DropdownMenuContent className={"w-44"}>
              <DropdownMenuGroup>
                {links.map((l) => (
                  <DropdownMenuItem
                    key={l.href}
                    render={<Link href={l.href as Route} />}
                  >
                    {l.label}
                  </DropdownMenuItem>
                ))}
                {!user?.id && (
                  <DropdownMenuItem render={<Link href={"/signin"} />}>
                    Login
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
