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
import { NAV_LINKS } from "@/constants/nav.constants"
import { NavLinks } from "./nav-links"

export async function Navbar() {
  const user = await getCurrentUser()

  return (
    <header className="pt-0.5r sticky top-0 z-40 border-t border-b bg-background backdrop-blur-md">
      <div className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 border-x px-4">
        <div className="flex items-center gap-6">
          <Logo />
        </div>

        <NavLinks />

        {/* <div className="hidden max-w-xs flex-1 items-center md:flex">
          <CommandMenu />
        </div> */}

        <div className="flex items-center gap-2">
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
                {NAV_LINKS.map((l) => (
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
