"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { Route } from "next"

export interface BookCardProps {
  /** Book title — required */
  title: string
  /** Short blurb / synopsis — required */
  description: string
  /** Author name, shown as "by {author}" */
  author?: string
  /** Cover image URL. Falls back to a monogram cover if omitted. */
  coverImage?: string
  /** Small eyebrow label, e.g. "Fiction", "Sci-Fi" */
  genre?: string
  /** 0–5 rating, renders filled stars up to the nearest whole number */
  rating?: number
  /** Publication year, shown in the meta row */
  year?: number | string
  /** If provided, the whole card becomes a link */
  href?: string
  className?: string
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  hover: {
    y: -6,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

const coverVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.045,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

const spineVariants: Variants = {
  rest: { opacity: 0.55 },
  hover: { opacity: 1, transition: { duration: 0.3 } },
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={13}
      height={13}
      aria-hidden
      className={filled ? "fill-[#8a5a2b]" : "fill-[#e4dccb]"}
    >
      <path d="M10 1.5l2.47 5.27 5.53.65-4.1 3.88 1.08 5.7L10 14.9l-4.98 2.1 1.08-5.7-4.1-3.88 5.53-.65L10 1.5z" />
    </svg>
  )
}

export function BookCard({
  title,
  description,
  author,
  coverImage,
  genre,
  rating,
  year,
  href,
  className = "",
}: BookCardProps) {
  const prefersReducedMotion = useReducedMotion()

  const variants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        hover: {},
      }
    : cardVariants

  const initials = title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: "-40px" }}
      variants={variants}
      className={`group relative isolate flex w-full max-w-xs flex-col overflow-hidden rounded-md bg-[#faf7f0] shadow-[0_1px_2px_rgba(28,25,23,0.08),0_1px_3px_rgba(28,25,23,0.06)] transition-shadow duration-300 hover:shadow-[0_18px_30px_-12px_rgba(28,25,23,0.28)] ${className}`}
    >
      {href && (
        <Link
          href={href as Route}
          aria-label={title}
          className="absolute inset-0 z-20 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a5a2b]"
        />
      )}

      {/* Spine accent */}
      <motion.span
        aria-hidden
        variants={spineVariants}
        initial="rest"
        className="absolute inset-y-0 left-0 z-10 w-1.5 bg-linear-to-b from-[#9c6b34] via-[#7a4a24] to-[#5c3719]"
      />

      {/* Page-edge lines */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-3 right-0 z-10 flex flex-col gap-0.75"
      >
        <span className="h-full w-0.5 bg-[#e7ddc9]" />
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-4 right-0.75 z-10 h-[calc(100%-2rem)] w-px bg-[#efe7d6]"
      />

      {/* Cover */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-[#efe7d6] pl-1.5">
        <motion.div
          variants={coverVariants}
          initial="rest"
          className="relative h-full w-full"
        >
          {coverImage ? (
            <Image
              src={coverImage}
              alt={`Cover of ${title}`}
              fill
              sizes="(max-width: 640px) 100vw, 320px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#7a4a24] via-[#8a5a2b] to-[#5c3719]">
              <span className="font-serif text-3xl tracking-wide text-[#faf7f0]/90">
                {initials || "?"}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Body */}
      <div className="relative z-10 flex flex-1 flex-col gap-2 px-5 pt-4 pb-5">
        {genre && (
          <span className="text-[11px] font-medium tracking-[0.08em] text-[#8a5a2b] uppercase">
            {genre}
          </span>
        )}

        <h3 className="line-clamp-2 font-serif text-lg leading-snug text-[#1c1917]">
          {title}
        </h3>

        {author && (
          <p className="text-sm text-[#1c1917]/60 italic">by {author}</p>
        )}

        <p className="line-clamp-3 text-sm leading-relaxed text-[#1c1917]/70">
          {description}
        </p>

        {(rating !== undefined || year !== undefined) && (
          <div className="mt-auto flex items-center justify-between pt-3">
            {rating !== undefined ? (
              <div
                className="flex items-center gap-0.5"
                aria-label={`Rated ${rating} out of 5`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} filled={i < Math.round(rating)} />
                ))}
              </div>
            ) : (
              <span />
            )}
            {year !== undefined && (
              <span className="text-xs text-[#1c1917]/45 tabular-nums">
                {year}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  )
}

export default BookCard
