import { Account, AuthOptions, Profile as NextAuthProfile } from "next-auth"
import Google from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import {
  createAuthSession,
  getOrCreateOAuthUser,
} from "@/features/auth/auth.service"
import { setAuthCookie } from "@/features/auth/auth.cookie"

interface CustomProfile extends NextAuthProfile {
  picture?: string
  avatar_url?: string
  email_verified?: boolean
}

export const authOptions: AuthOptions = {
  callbacks: {
    async signIn({
      account,
      profile,
    }: {
      account: Account | null
      profile?: CustomProfile | undefined
    }) {
      if (!account || !profile) return false
      if (account?.provider === "google" || account?.provider === "github") {
        console.log({ profile, account })

        const userInfo = {
          name: profile?.name as string,
          email: profile?.email as string,
          avatar: profile.picture || profile.avatar_url,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          isEmailVerified: profile?.email_verified ?? false,
        }

        if (!userInfo.email) {
          return false
        }

        try {
          const user = await getOrCreateOAuthUser(userInfo)

          console.log("Authenticated user:", user)

          const { accessToken, refreshToken } =
            await createAuthSession({
              email: userInfo.email,
              userId: user.id,
            })

          await setAuthCookie({ accessToken, refreshToken })

          return true
        } catch (error) {
          console.error("OAuth authentication failed:", error)

          return false
        }
      }
      return true
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
}
