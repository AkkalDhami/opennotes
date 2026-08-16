import { cn } from "@/lib/utils"

export function Section({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      {...props}
      className={cn("screen-line-after px-4 py-4 sm:py-8", className)}
    >
      {children}
    </section>
  )
}
