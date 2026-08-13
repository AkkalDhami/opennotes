"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="md:size-8"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <HugeiconsIcon
          icon={Sun03Icon}
          size={24}
          color="currentColor"
          strokeWidth={2}
          className="h-[1.3rem] w-[1.3rem] scale-0 -rotate-90 transition-all dark:scale-100 dark:rotate-0"
        />
        <HugeiconsIcon
          icon={Moon02Icon}
          size={24}
          color="currentColor"
          strokeWidth={2}
          className="absolute h-[1.3rem] w-[1.3rem] scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90"
        />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}
