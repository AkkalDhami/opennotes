"use client"
import Link from "next/link"
import { motion } from "motion/react"
import { Route } from "next"
import { VerifiedUserAvatar } from "@/components/shared/verified-user-avatar"
import { formatNoteMeta } from "@/utils/format"
import { Tilt } from "@/components/ui/tilt"
import { NoiseTexture } from "../ui/noise-texture"

export type CollectionCardData = {
  name: string
  slug: string
  description: string | null
  noteCount: number
  downloads: number
  views: number
  saves: number
  creator: {
    username: string
    name: string
    isVerified?: boolean | null
    avatarUrl?: string | null
  }
}

export function CollectionCard({
  c,
  index = 0,
}: {
  c: CollectionCardData
  index?: number
}) {
  const href = `/collections/${c.slug}`
  return (
    <Tilt isRevese>
      <motion.article
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.18,
          ease: "easeOut",
          delay: Math.min(index, 8) * 0.02,
        }}
        className="group relative flex flex-col gap-4 rounded-lg border bg-card p-5 transition-colors hover:bg-muted"
      >
        <>
          <NoiseTexture noiseOpacity={0.2} />
          <Link
            href={href as Route}
            aria-label={c.name}
            className="absolute inset-0 z-0 rounded-lg"
          />
          <div className="space-y-1.5">
            <h3 className="ine-clamp-2 text-lg leading-snug font-medium underline-offset-2 group-hover:underline">
              {c.name}
            </h3>
            {c.description && (
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {c.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <VerifiedUserAvatar
              displayName={c.creator.username}
              emailVerified={c.creator.isVerified ?? true}
              avatarUrl={c.creator.avatarUrl}
            />

            <Link
              href={`/contributors/${c.creator.username}`}
              className="relative z-10 text-sm underline-offset-2 hover:underline"
            >
              <h4 className="text-base font-medium">{c.creator.name}</h4>
              <span className="text-muted-foreground">
                @{c.creator.username}
              </span>
            </Link>
          </div>
          <p className="mt-auto text-sm text-muted-foreground lowercase">
            {formatNoteMeta([
              `${c.noteCount} Notes`,
              `${c.downloads} Downloads`,
              `${c.views} Views`,
              `${c.saves} Saves`,
            ])}
          </p>
        </>
      </motion.article>
    </Tilt>
  )
}
