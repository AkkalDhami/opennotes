"use client"

import { cn } from "@/lib/utils"
import { motion, stagger, useAnimate } from "motion/react"
import { useEffect } from "react"

export function AnimatedText({
  text,
  className,
  duration = 0.3,
  delay = 0.03,
}: {
  text: string
  duration?: number
  delay?: number
  className?: string
}) {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    startAnimate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startAnimate = () => {
    animate(
      "span",
      {
        opacity: 1,
        filter: "blur(0)",
        y: 0,
      },
      {
        duration: duration,
        ease: "easeInOut",
        delay: stagger(delay),
      }
    )
  }

  return (
    <div ref={scope} className={cn("leading-snug wrap-break-word", className)}>
      {text.split(" ").map((word, idx) => (
        <motion.span
          key={idx}
          style={{
            opacity: 0,
            filter: "blur(10px)",
            y: 10,
          }}
          className="inline-block"
        >
          {word} &nbsp;
        </motion.span>
      ))}
    </div>
  )
}
