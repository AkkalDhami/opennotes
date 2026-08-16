"use client"

import { motion, type Variants } from "motion/react"
import { useId } from "react";

export type Rank = number

export const RANK_TEXT: Record<Rank, string> = {
  1: "1st place contributor",
  2: "2nd place contributor",
  3: "3rd place contributor",
  4: "4th place contributor",
  5: "5th place contributor",
  6: "6th place contributor",
  7: "7th place contributor",
  8: "8th place contributor",
  9: "9th place contributor",
  10: "10th place contributor",
}

type PodiumRank = 1 | 2 | 3

function isPodium(rank: Rank): rank is PodiumRank {
  return rank === 1 || rank === 2 || rank === 3
}

interface Tone {
  ringFrom: string
  ringTo: string
  faceLight: string
  faceMid: string
  faceDeep: string
  line: string
  numeral: string
  glow: string
}

const PODIUM_TONES: Record<PodiumRank, Tone> = {
  1: {
    ringFrom: "#FCE7A0",
    ringTo: "#B8860B",
    faceLight: "#FFF3C4",
    faceMid: "#F6C445",
    faceDeep: "#C6900E",
    line: "#8B6508",
    numeral: "#6B4A05",
    glow: "rgba(246,196,69,0.55)",
  },
  2: {
    ringFrom: "#F4F6F8",
    ringTo: "#8B95A1",
    faceLight: "#FFFFFF",
    faceMid: "#D7DEE3",
    faceDeep: "#9CA6B0",
    line: "#6B7480",
    numeral: "#4B535C",
    glow: "rgba(190,199,207,0.55)",
  },
  3: {
    ringFrom: "#F0C39A",
    ringTo: "#8B4A24",
    faceLight: "#F6D9BB",
    faceMid: "#CD7F32",
    faceDeep: "#8B4A24",
    line: "#5C2E13",
    numeral: "#4A2610",
    glow: "rgba(205,127,50,0.5)",
  },
}

const BADGE_TONE: Tone = {
  ringFrom: "#E9EBEE",
  ringTo: "#9AA2AC",
  faceLight: "#FBFBFC",
  faceMid: "#DEE1E5",
  faceDeep: "#AEB4BC",
  line: "#6B7280",
  numeral: "#3F4650",
  glow: "rgba(154,162,172,0.35)",
}

interface Leaf {
  cx: number
  cy: number
  rotation: number
}

function buildBranch(
  startDeg: number,
  endDeg: number,
  count: number,
  r: number
): Leaf[] {
  const leaves: Leaf[] = []

  const round = (value: number) => Number(value.toFixed(6))

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1)
    const deg = startDeg + (endDeg - startDeg) * t
    const rad = (deg * Math.PI) / 180

    leaves.push({
      cx: round(100 + r * Math.cos(rad)),
      cy: round(100 + r * Math.sin(rad)),
      rotation: round(deg),
    })
  }

  return leaves
}

const LEFT_BRANCH = buildBranch(150, 95, 5, 80)
const RIGHT_BRANCH = buildBranch(30, 85, 5, 80)

const iconVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -8, y: 10 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 18, delay },
  }),
}

const labelVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut", delay: delay + 0.15 },
  }),
}

interface IconProps {
  rank: Rank
  size?: number
  delay?: number
  className?: string
}

function PodiumIcon({
  rank,
  size = 176,
  delay = 0,
  className = "",
}: IconProps) {
  const tone = PODIUM_TONES[rank as PodiumRank]
  const id = useId()

  const gradId = `${id}-face`
  const ringId = `${id}-ring`
  const clipId = `${id}-clip`
  const glowId = `${id}-glow`

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      custom={delay}
      variants={iconVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.06, y: -6, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 16 }}
      style={{ filter: `drop-shadow(0 10px 20px ${tone.glow})` }}
    >
      <defs>
        <radialGradient id={gradId} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={tone.faceLight} />
          <stop offset="55%" stopColor={tone.faceMid} />
          <stop offset="100%" stopColor={tone.faceDeep} />
        </radialGradient>
        <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={tone.ringFrom} />
          <stop offset="100%" stopColor={tone.ringTo} />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={clipId}>
          <circle cx="100" cy="100" r="83" />
        </clipPath>
      </defs>

      <circle
        cx="100"
        cy="100"
        r="82"
        fill={tone.faceMid}
        opacity="0.35"
        filter={`url(#${glowId})`}
      />
      <circle cx="100" cy="100" r="92" fill={`url(#${ringId})`} />
      <circle cx="100" cy="100" r="83" fill={`url(#${gradId})`} />
      <circle
        cx="100"
        cy="100"
        r="74"
        fill="none"
        stroke={tone.line}
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />

      <g opacity="0.55">
        {LEFT_BRANCH.map((leaf, i) => (
          <ellipse
            key={`l-${i}`}
            cx={leaf.cx}
            cy={leaf.cy}
            rx={7 - i * 0.4}
            ry={3}
            fill={tone.line}
            transform={`rotate(${leaf.rotation} ${leaf.cx} ${leaf.cy})`}
          />
        ))}
        {RIGHT_BRANCH.map((leaf, i) => (
          <ellipse
            key={`r-${i}`}
            cx={leaf.cx}
            cy={leaf.cy}
            rx={7 - i * 0.4}
            ry={3}
            fill={tone.line}
            transform={`rotate(${leaf.rotation} ${leaf.cx} ${leaf.cy})`}
          />
        ))}
      </g>

      <path
        d="M100 42 L103.2 51.2 L113 51.6 L105.2 57.6 L108 67 L100 61.3 L92 67 L94.8 57.6 L87 51.6 L96.8 51.2 Z"
        fill={tone.numeral}
        opacity="0.85"
      />

      <text
        x="100"
        y="122"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight={700}
        fontSize="48"
        fill={tone.numeral}
      >
        {rank}
      </text>

      <g clipPath={`url(#${clipId})`}>
        <motion.rect
          x="-40"
          y="0"
          width="24"
          height="220"
          fill="white"
          opacity="0.35"
          transform="rotate(24 0 0)"
          initial={{ x: -60 }}
          animate={{ x: 220 }}
          transition={{
            duration: 1.3,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 3.2,
            delay: delay + 0.6,
          }}
        />
      </g>
    </motion.svg>
  )
}

function BadgeIcon({ rank, size = 120, delay = 0, className = "" }: IconProps) {
  const tone = BADGE_TONE
  const gradId = `badge-face-${rank}`
  const ringId = `badge-ring-${rank}`

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      custom={delay}
      variants={iconVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.08, y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      style={{ filter: `drop-shadow(0 6px 12px ${tone.glow})` }}
    >
      <defs>
        <radialGradient id={gradId} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={tone.faceLight} />
          <stop offset="55%" stopColor={tone.faceMid} />
          <stop offset="100%" stopColor={tone.faceDeep} />
        </radialGradient>
        <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={tone.ringFrom} />
          <stop offset="100%" stopColor={tone.ringTo} />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="88" fill={`url(#${ringId})`} />
      <circle cx="100" cy="100" r="80" fill={`url(#${gradId})`} />
      <circle
        cx="100"
        cy="100"
        r="72"
        fill="none"
        stroke={tone.line}
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />

      <text
        x="100"
        y="118"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        fontWeight={700}
        fontSize="44"
        fill={tone.numeral}
      >
        {rank}
      </text>
    </motion.svg>
  )
}

interface RankMedalProps {
  size?: number
  delay?: number
  showLabel?: boolean
  className?: string
}

export function GoldMedal(props: RankMedalProps) {
  return <RankMedal rank={1} {...props} />
}

export function SilverMedal(props: RankMedalProps) {
  return <RankMedal rank={2} {...props} />
}

export function BronzeMedal(props: RankMedalProps) {
  return <RankMedal rank={3} {...props} />
}

export function RankBadge(props: RankMedalProps & { rank: Rank }) {
  return <RankMedal {...props} />
}

interface RankMedalWithRankProps extends RankMedalProps {
  rank: Rank
}

export function RankMedal({
  rank,
  size,
  delay = 0,
  showLabel = true,
  className = "",
}: RankMedalWithRankProps) {
  const podium = isPodium(rank)
  const resolvedSize = size ?? (podium ? 176 : 120)

  return (
    <div className="inline-flex flex-col items-center gap-3">
      {podium ? (
        <PodiumIcon
          rank={rank}
          size={resolvedSize}
          delay={delay}
          className={className}
        />
      ) : (
        <BadgeIcon
          rank={rank}
          size={resolvedSize}
          delay={delay}
          className={className}
        />
      )}
      {showLabel && (
        <motion.span
          custom={delay}
          variants={labelVariants}
          initial="hidden"
          animate="visible"
          className={`font-medium tracking-wide text-neutral-500 ${podium ? "text-sm" : "text-xs"}`}
        >
          {RANK_TEXT[rank]}
        </motion.span>
      )}
    </div>
  )
}
