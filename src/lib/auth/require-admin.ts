import { redirect } from "next/navigation"
import { getCurrentUser } from "./get-current-user"

export async function requireAdmin() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/signin")
  }

  if (user.role !== "ADMIN") {
    redirect("/signin")
  }

  return user
}
