import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb"

import { AdminSidebar } from "@/components/layouts/admin-sidebar"
import { ThemeToggle } from "@/components/shared/theme-toggle"

import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { requireAdmin } from "@/lib/auth/require-admin"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
}

/** Admin only: `requireAdmin()` reads the auth cookie, so nothing here is static. */
export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin()

  if (!user || user.role !== "ADMIN" || !user.name || !user.username) {
    return redirect("/signin")
  }

  return (
    <SidebarProvider>
      <AdminSidebar
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          avatarId: user.avatarId,
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
