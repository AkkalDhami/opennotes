import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"
import { SessionProvider } from "@/components/providers/session-provider"
import { Toaster } from "react-hot-toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DialogProvider } from "@/components/providers/dialog-provider"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const fontHeading = Geist({
  subsets: ["latin"],
  variable: "--font-heading",
})

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
        fontMono.variable,
        fontHeading.variable,
        "font-sans",
        inter.variable,
        "selection:bg-brand selection:text-background"
      )}
    >
      <body>
        <ThemeProvider>
          <Analytics />
          <DialogProvider />
          <Toaster />
          <SessionProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
