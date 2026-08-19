import "./styles/globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"
import { SessionProvider } from "@/components/providers/session-provider"
import { Toaster } from "react-hot-toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DialogProvider } from "@/components/providers/dialog-provider"
import { Analytics } from "@vercel/analytics/next"
import { Metadata } from "next"
import { APP_NAME, BASE_GITHUB_REPO, SITE_URL } from "@/constants/app.constants"
import { DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS } from "@/lib/seo"
import { ThemeScript } from "@/components/providers/theme-script"
import { AppearanceProvider } from "@/components/providers/appearance-provider"
import { FONT_VARIABLES } from "@/lib/appearance/fonts"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${APP_NAME} — Find and Share Educational Notes`,
    template: `%s | ${APP_NAME}`,
  },

  description: DEFAULT_DESCRIPTION,

  applicationName: APP_NAME,

  keywords: [
    "educational notes",
    "study notes",
    "student notes",
    "PDF notes",
    "study materials",
    "class notes",
    ...DEFAULT_KEYWORDS,
  ],

  authors: [
    {
      name: APP_NAME,
    },
    {
      name: "Akkal Dhami",
      url: BASE_GITHUB_REPO,
    },
  ],

  creator: APP_NAME,
  publisher: APP_NAME,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} — Find and Share Educational Notes`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — Educational Notes`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Find and Share Educational Notes`,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        FONT_VARIABLES,
        "selection:bg-muted selection:text-foreground"
      )}
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <AppearanceProvider>
            <Analytics />
            <DialogProvider />
            <Toaster />
            <SessionProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </SessionProvider>
          </AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
