import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb"

import { UserSidebar } from "@/components/layouts/user-sidebar"
import { ThemeToggle } from "@/components/shared/theme-toggle"

import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: {
    default: "OpenNotes",
    template: "%s | Profile | OpenNotes",
  },
  // robots: {
  //   index: false,
  //   follow: false,
  // },
}

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || !user.name || !user.username) {
    return redirect("/signin")
  }

  return (
    <SidebarProvider>
      <UserSidebar
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          username: user.username,
          bio: user.bio,
          emailVerified: user.emailVerified ?? false,
        }}
      />
      <SidebarInset>
        <header className="sticky top-0 right-0 left-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background pr-6">
          <div className="flex items-center gap-4 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mt-2 h-4" />
            <AdminBreadcrumb />
          </div>

          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
