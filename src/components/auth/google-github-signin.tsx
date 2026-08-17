"use client"

import { signIn, useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/constants/app.constants"
import Link from "next/link"

export function GoogleAndGitHubSignin() {
  const { status } = useSession()

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-medium tracking-tight">
            {APP_NAME}
          </Link>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            A place where students discover, share, and learn from notes
            together.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold tracking-tight">
              Welcome back
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to continue to your account.
            </p>
          </div>

          {/* OAuth buttons */}
          <div className="mt-7 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              disabled={status === "loading"}
              onClick={() =>
                signIn("google", {
                  callbackUrl: "/",
                })
              }
            >
              {/* Google */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.21 2.91-7.42Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.54 13.85A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.27.31-1.85V7.62H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.38l3.24-2.53Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.12c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.2 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.37l3.24 2.53C7.31 7.84 9.46 6.12 12 6.12Z"
                />
              </svg>

              <span>Continue with Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              disabled={status === "loading"}
              onClick={() =>
                signIn("github", {
                  callbackUrl: "/",
                })
              }
            >
              {/* GitHub */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.23 1.84 1.23 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.76.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z" />
              </svg>

              <span>Continue with GitHub</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />

            <span className="shrink-0 text-xs text-muted-foreground">
              Secure authentication
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Terms */}
          <p className="text-center text-xs leading-5 text-muted-foreground">
            By continuing, you agree to our{" "}
            <a
              href="/terms"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Study together.{" "}
            <span className="font-medium text-foreground">
              Share knowledge.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
