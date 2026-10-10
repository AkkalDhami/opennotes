import { Footer } from "@/components/layouts/footer"
import { Navbar } from "@/components/layouts/navbar"
import { BackToTop } from "@/components/shared/back-to-top"

export const dynamic = "force-dynamic"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative min-h-screen w-full bg-background">
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, var(--primary), transparent 70%), var(--background)",
            opacity: 0.14,
          }}
        />
        {/* <div
          className="absolute inset-0 z-0 dark:hidden"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0, 0, 0, 0.07), transparent 70%), #ffffff",
          }}
        /> */}
        <Navbar />
        <main className="relative max-w-svw overflow-hidden">{children} </main>
        <Footer />

        <BackToTop />
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-[calc(--spacing(24)+env(safe-area-inset-bottom,0))] bg-linear-to-b from-transparent from-[calc(env(safe-area-inset-bottom,0%))] to-background mask-linear-[to_top,var(--background)_15%,transparent] backdrop-blur-[1px]"></div>
      </div>
    </>
  )
}
