import { GoogleAndGitHubSignin } from "@/components/auth/google-github-signin"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account",
}

export default function Page() {
  return (
    <div
      className={
        "flex h-screen w-full items-center justify-center bg-neutral-950"
      }
    >
      <GoogleAndGitHubSignin />
    </div>
  )
}
