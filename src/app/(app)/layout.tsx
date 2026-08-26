import { Footer } from "@/components/layouts/footer"
import { Navbar } from "@/components/layouts/navbar"
import { BackToTop } from "@/components/shared/back-to-top"
// import { NoiseTexture } from "@/components/ui/noise-texture"

/**
 * `Navbar` awaits `getCurrentUser()`, which reads the `access_token` cookie, so
 * no route in this group can be prerendered — the shell is personalised. Next
 * otherwise fails the build with `DYNAMIC_SERVER_USAGE` while collecting page
 * data for `/`. Declaring it here says so explicitly instead of letting each
 * page discover it at build time.
 */
export const dynamic = "force-dynamic"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="relative max-w-svw overflow-hidden">{children} </main>
      <Footer />
      <BackToTop />
      {/* <NoiseTexture noiseOpacity={0.1} /> */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-[calc(--spacing(24)+env(safe-area-inset-bottom,0))] bg-linear-to-b from-transparent from-[calc(env(safe-area-inset-bottom,0%))] to-background mask-linear-[to_top,var(--background)_15%,transparent] backdrop-blur-[1px]"></div>
    </>
  )
}
