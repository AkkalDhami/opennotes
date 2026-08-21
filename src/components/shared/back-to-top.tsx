"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp02Icon } from "@hugeicons/core-free-icons"
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed right-6 bottom-22 z-40 sm:bottom-12"
        >
          <Button
            variant="default"
            size="icon-lg"
            onClick={() => {
              scrollToTop()
            }}
            className="rounded-full backdrop-blur-md"
            aria-label="Back to top"
          >
            <HugeiconsIcon
              icon={ArrowUp02Icon}
              size={25}
              color="currentColor"
              strokeWidth={1.5}
            />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
