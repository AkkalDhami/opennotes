/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import * as React from "react"
import { useCallback, useEffect, useLayoutEffect, useRef } from "react"
import {
  useAnimate,
  useReducedMotion,
  type DOMKeyframesDefinition,
  type Transition,
} from "motion/react"

// If your installed version of `motion` doesn't export
// `DOMKeyframesDefinition` from "motion/react", it also lives at
// "motion-dom" (and, in classic Framer Motion, "framer-motion") — swap the
// import path, the type name is the same.

/** Framer's Border control shape: either one fused width or four per-side
 *  widths, plus `borderStyle` / `borderColor`. Widths can arrive as a number
 *  or a CSS length string depending on the control, hence the union. */
type BorderStyleValue =
  | "solid"
  | "dashed"
  | "dotted"
  | "double"
  | "groove"
  | "ridge"
  | "inset"
  | "outset"
  | "none"

interface BorderControl {
  borderWidth?: number | string
  borderTopWidth?: number | string
  borderRightWidth?: number | string
  borderBottomWidth?: number | string
  borderLeftWidth?: number | string
  borderStyle?: BorderStyleValue
  borderColor?: string
}

/** ControlType.Image hands back a plain URL string in most Framer versions
 *  and a `{ src, srcSet }` object in others. */
interface FramerImageAsset {
  src: string
  srcSet?: string
  alt?: string
  width?: number
  height?: number
}

type FramerImageValue = string | FramerImageAsset | undefined

const borderWidthOf = (b: BorderControl | undefined): number =>
  Math.max(
    0,
    ...[
      b?.borderWidth,
      b?.borderTopWidth,
      b?.borderRightWidth,
      b?.borderBottomWidth,
      b?.borderLeftWidth,
    ].map((v) => parseFloat(String(v ?? "")) || 0)
  )

const borderColorOf = (b: BorderControl | undefined): string =>
  b?.borderColor ?? "transparent"

/** The border box WITHOUT its colour. borderColor is animated imperatively, so
 *  leaving it in the inline style would let a re-render mid-hover snap it back
 *  to the resting value — the same hazard the measured borderRadius avoids. */
const borderBoxOf = (b: BorderControl | undefined): React.CSSProperties => {
  const { borderColor, ...rest } = b ?? {}
  return rest as React.CSSProperties
}

// The two icons always swap on their own quick timing — this is the swap's
// character, not something the Transition control should stretch.
const ICON_TRANSITION: Transition = { duration: 0.25, ease: "easeInOut" }

/** Body colours in one group: the resting pair, then the hover pair. The border
 *  hover colour sits with the Border control instead, and the icon has its own
 *  group below — nine loose swatches were unreadable. */
type Colors = {
  fill?: string
  textColor?: string
  hoverFill?: string
  hoverTextColor?: string
}

const COLOR_DEFAULTS: Required<Colors> = {
  fill: "var(--colo-accent-foreground)",
  textColor: "var(--color-foreground)",
  hoverFill: "var(--color-primary)",
  hoverTextColor: "#FFFFFF",
}

// Icon badge tuned for a normal, inline (16px-text) button rather than a
// hero-sized CTA: a 16px glyph in ~8px of padding gives a ~32px badge,
// proportional to 16px type instead of dwarfing it.
const ICON_DEFAULTS = {
  background: "#222222",
  color: "#FFFFFF",
  hoverBackground: "#FFFFFF",
  hoverColor: "#000000",
  restSymbol: "↗",
  hoverSymbol: "↗",
  size: 16,
  padding: 8,
  angle: 315,
}

// Single source of truth for the label's resting type size — read by both the
// prop default below AND the Font control's defaultValue, so Framer's canvas
// (which always renders from the control default, never the JS fallback)
// can't silently drift to a smaller size than the code implies.
const DEFAULT_FONT: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  letterSpacing: "0.03em",
  lineHeight: "1.2em",
}

/** Rounded is a percent of the MAXIMUM possible radius — half the short side —
 *  so 100 is a true pill at any button size and 0 is a square corner. A CSS
 *  percentage border-radius is not the same thing: it resolves per axis and
 *  gives an ellipse, so a wide button would bulge instead of forming a stadium.
 *  Hence the measured conversion. */
const radiusFromPercent = (w: number, h: number, pct: number) =>
  (Math.min(w, h) / 2) * (Math.max(0, Math.min(100, pct)) / 100)

// Layout must land before the browser paints, otherwise the button renders at a
// square corner for one frame and visibly snaps. useLayoutEffect is client-only;
// fall back on the server to silence the warning.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

/** Movement Angle in degrees: 0 points right, angles run clockwise (screen y
 *  grows downward). Purely the direction the two icons swap along — it never
 *  rotates the icon itself, which is whatever glyph or image the user picked. */
const normalizeAngle = (deg: number | string | undefined): number => {
  const parsed = typeof deg === "number" ? deg : parseFloat(String(deg ?? ""))
  if (!Number.isFinite(parsed)) return ICON_DEFAULTS.angle
  return ((parsed % 360) + 360) % 360
}

/** Accepts either shape ControlType.Image can hand back rather than rendering
 *  `[object Object]` as a broken image. */
const srcOf = (img: FramerImageValue): string =>
  typeof img === "string" ? img : (img?.src ?? "")

/** A font glyph's ink is not centered in its own advance box — flexbox can only
 *  center that box, never the ink inside it, and an arrow's box is especially
 *  lopsided (most fonts pad the tail more than the head). The eight compass
 *  arrows are common enough as the symbol field's value that they're worth
 *  drawing as an SVG instead: a diagonal line whose midpoint sits exactly on
 *  the viewBox's own center, so centering is geometric fact, not font luck.
 *  Angles follow the same 0=right/clockwise convention as Movement Angle, so
 *  the glyph a designer picks always matches the direction it travels. Any
 *  symbol outside this set (letters, "+", emoji, …) still renders as text. */
const ARROW_ANGLES: Record<string, number> = {
  "↗": 315,
  "→": 0,
  "↘": 45,
  "↓": 90,
  "↙": 135,
  "←": 180,
  "↖": 225,
  "↑": 270,
}

const arrowAngleOf = (symbol: string): number | undefined =>
  ARROW_ANGLES[symbol.trim()]

interface IconSettings {
  type?: "symbol" | "image"
  restSymbol?: string
  hoverSymbol?: string
  restImage?: FramerImageValue
  hoverImage?: FramerImageValue
  color?: string
  hoverColor?: string
  size?: number
  padding?: number
  rounded?: number
  background?: string
  hoverBackground?: string
  angle?: number
  side?: "left" | "right"
  /** Previous key. Still read so a live instance keeps its placement. */
  position?: "left" | "right"
}

interface AnimatedButtonProps {
  label?: string
  showText?: boolean
  textSide?: "top" | "bottom"
  font?: React.CSSProperties
  padding?: string
  rounded?: number
  colors?: Colors
  border?: BorderControl
  hoverBorderColor?: string
  addIcon?: boolean
  icon?: IconSettings
  gap?: number
  link?: string
  transition?: Transition
  newTab?: boolean
  style?: React.CSSProperties
}

export function LabelSlideButton(props: AnimatedButtonProps) {
  const {
    label = "LABEL SLIDE",
    showText = true,
    textSide = "top",
    font,
    // A normal inline button's padding, not a hero CTA's — roughly a
    // 10px/16px box around 16px type.
    padding = "10px 16px",
    rounded = 100,
    colors,
    border = {
      borderColor: "#000000",
      borderStyle: "solid",
      borderWidth: 0,
    },
    hoverBorderColor,
    addIcon = true,
    // A group the designer never opened arrives `undefined`, and so does any
    // field inside one they only partly filled — hence the per-field
    // fallback below, never the control's defaultValue alone. Sized to
    // match ICON_DEFAULTS (16px glyph / 8px padding) rather than the old
    // 26px/14px hero badge.
    icon = {
      side: "left",
      size: 16,
      type: "symbol",
      angle: 315,
      color: "#FFFFFF",
      padding: 8,
      rounded: 100,
      restImage: "",
      background: "#222222",
      hoverColor: "#000000",
      hoverImage: "",
      restSymbol: "↗",
      hoverSymbol: "↗",
      hoverBackground: "#FFFFFF",
    },
    // Tight gap for a 16px label + 32px badge, not the 32px hero spacing.
    gap = 8,
    link,
    // Module constant, NOT an inline object literal: a fresh object every
    // render makes `opts` → `apply` → the resting-state layout effect all
    // re-run on every single render.
    transition = {
      ease: [0.16, 1, 0.3, 1],
      mass: 1,
      type: "tween",
      damping: 60,
      duration: 0.35,
      stiffness: 800,
    },
    newTab = true,
    style,
  } = props

  const {
    type: iconType = "symbol",
    restSymbol = ICON_DEFAULTS.restSymbol,
    hoverSymbol = ICON_DEFAULTS.hoverSymbol,
    restImage,
    hoverImage,
    color: iconColor = ICON_DEFAULTS.color,
    hoverColor: hoverIconColor = ICON_DEFAULTS.hoverColor,
    size: iconSizeProp = ICON_DEFAULTS.size,
    padding: iconPaddingProp = ICON_DEFAULTS.padding,
    // 100 = the circular badge this button has always shipped. It is the
    // badge's shape now, not just the image's, so it cannot default square.
    rounded: iconRounded = 100,
    background: iconBg = ICON_DEFAULTS.background,
    hoverBackground: hoverIconBg = ICON_DEFAULTS.hoverBackground,
    angle: moveAngleProp = ICON_DEFAULTS.angle,
    side: iconSideProp,
    position: iconPositionLegacy,
  } = icon

  // Placement key is `side` across every button. `position` was this
  // file's older key and is still read, so a live instance keeps its side.
  const iconPosition = iconSideProp ?? iconPositionLegacy ?? "left"

  const [scope, animate] = useAnimate()
  const labelUpRef = useRef<HTMLSpanElement>(null)
  const labelDownRef = useRef<HTMLSpanElement>(null)
  const badgeRef = useRef<HTMLSpanElement>(null)
  // Wrapper spans, not the icon elements themselves: an <img> or an SVG root
  // carries its own `x`/`y` attributes, so animating transform x/y on it
  // collides with them.
  const iconOutRef = useRef<HTMLSpanElement>(null)
  const iconInRef = useRef<HTMLSpanElement>(null)
  const hovered = useRef(false)
  const reducedMotion = useReducedMotion()

  // Rounded is a percent of the measured box, so it can only be resolved from
  // the rendered size. offsetWidth/Height, NOT getBoundingClientRect: Framer's
  // canvas renders inside a CSS-scaled container, so a rect comes back
  // multiplied by the zoom level while the layout box does not.
  useIsoLayoutEffect(() => {
    const root = scope.current as HTMLElement | null
    if (!root) return
    const apply = () => {
      // eslint-disable-next-line react-hooks/immutability
      const w = root.offsetWidth
      const h = root.offsetHeight
      if (!w || !h) return
      root.style.borderRadius = `${radiusFromPercent(w, h, rounded)}px`
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(root)
    return () => ro.disconnect()
  }, [scope, rounded, padding, showText])

  // Spread the WHOLE font object: with `controls: "extended"` Framer also
  // returns letterSpacing, lineHeight, textTransform and friends, and picking
  // four keys off it silently dropped every one of them. DEFAULT_FONT fills
  // in when the control is untouched, so the label never falls back to the
  // browser's default (small) size.
  const fontStyles: React.CSSProperties = { ...DEFAULT_FONT, ...(font ?? {}) }

  // The badge is the icon plus its padding on every side — there is no
  // separate badge dial to disagree with the icon size any more.
  const glyphSize = Math.max(1, Math.round(iconSizeProp))
  // Percent of the maximum radius (half the square box): 100 = a circle, 0 = a
  // square corner. Was raw px — the same number now means the same shape at
  // every icon size. ONE dial drives both the picture and the badge under it,
  // so a square image can never sit inside a round plate.
  const iconRadius = radiusFromPercent(glyphSize, glyphSize, iconRounded)
  const iconPadding = Math.max(0, Math.round(iconPaddingProp))
  const badgeSize = glyphSize + iconPadding * 2
  // The badge is square, so a CSS percentage resolves to the same shape on
  // both axes (it is only off-square boxes that would give an ellipse). CSS
  // `50%` is the full circle, hence the halving.
  const badgeRadius = `${Math.max(0, Math.min(100, Math.round(iconRounded))) / 2}%`

  // The pair swaps along the Movement Angle, so the outgoing icon always exits
  // the way the designer aimed it. 1.5× the icon clears the circle from any
  // start offset, including the shallow cardinal cases.
  const moveAngle = normalizeAngle(moveAngleProp)
  const travel = (glyphSize + 2) * 1.5
  const travelX = Math.cos((moveAngle * Math.PI) / 180) * travel
  const travelY = Math.sin((moveAngle * Math.PI) / 180) * travel

  // Text Side names where the resting label goes on hover: Top rolls it up and
  // brings the duplicate from below, Bottom is the same roll inverted.
  const labelExit = textSide === "bottom" ? "100%" : "-100%"
  const labelEnter = textSide === "bottom" ? "-100%" : "100%"

  const { fill, textColor, hoverFill, hoverTextColor } = {
    ...COLOR_DEFAULTS,
    ...(colors ?? {}),
  }

  const resolvedHoverBorderColor = hoverBorderColor ?? borderColorOf(border)

  const opts = useCallback(
    (): Transition => (reducedMotion ? { duration: 0 } : transition),
    [reducedMotion, transition]
  )

  const apply = useCallback(
    (toHover: boolean, instant: boolean) => {
      const t: Transition = instant ? { duration: 0 } : opts()
      // The icon swap keeps its own timing, but it still has to honour a
      // reduced-motion preference — opts() gates on it, so this must too.
      const it: Transition =
        instant || reducedMotion ? { duration: 0 } : ICON_TRANSITION

      const rootColors: DOMKeyframesDefinition = {
        backgroundColor: toHover ? hoverFill : fill,
        color: toHover ? hoverTextColor : textColor,
        borderColor: toHover ? resolvedHoverBorderColor : borderColorOf(border),
      }
      const badgeColors: DOMKeyframesDefinition = {
        backgroundColor: toHover ? hoverIconBg : iconBg,
        color: toHover ? hoverIconColor : iconColor,
      }

      // Instant means "this IS the resting paint" — a zero-duration
      // animate() still lands on the next tick, and these colours are no
      // longer in the inline style, so that would flash a transparent
      // button for one frame. Write them straight to the DOM instead.
      if (instant) {
        Object.assign(scope.current?.style ?? {}, rootColors)
        Object.assign(badgeRef.current?.style ?? {}, badgeColors)
      }

      if (scope.current && !instant) animate(scope.current, rootColors, t)
      if (labelUpRef.current)
        animate(
          labelUpRef.current,
          { y: toHover ? labelExit : "0%" } as DOMKeyframesDefinition,
          t
        )
      if (labelDownRef.current)
        animate(
          labelDownRef.current,
          { y: toHover ? "0%" : labelEnter } as DOMKeyframesDefinition,
          t
        )
      if (badgeRef.current && !instant)
        animate(badgeRef.current, badgeColors, t)
      if (iconOutRef.current)
        animate(
          iconOutRef.current,
          {
            x: toHover ? travelX : 0,
            y: toHover ? travelY : 0,
            opacity: toHover ? 0 : 1,
          } as DOMKeyframesDefinition,
          it
        )
      if (iconInRef.current)
        animate(
          iconInRef.current,
          {
            x: toHover ? 0 : -travelX,
            y: toHover ? 0 : -travelY,
            opacity: toHover ? 1 : 0,
          } as DOMKeyframesDefinition,
          it
        )
    },
    [
      animate,
      scope,
      opts,
      reducedMotion,
      fill,
      hoverFill,
      textColor,
      hoverTextColor,
      border,
      resolvedHoverBorderColor,
      iconBg,
      hoverIconBg,
      iconColor,
      hoverIconColor,
      travelX,
      travelY,
      labelExit,
      labelEnter,
    ]
  )

  // Snap to rest on mount and whenever a colour control changes, so Framer's
  // canvas always shows the resting state. Never while hovered.
  //
  // Layout effect, not useEffect: fill / text colour / border colour are no
  // longer declared inline (they are animated, and an inline copy lets a
  // re-render clobber the animated value), so this IS the first paint's
  // resting state — after paint would flash a transparent button.
  //
  // `showText` and `addIcon` are deps even though apply() never reads them:
  // toggling either back on remounts those spans with no transform, so the
  // duplicate label sits at y:0 stacked on the original — and the hover icon
  // at x/y:0 on top of the rest icon — until something parks them.
  useIsoLayoutEffect(() => {
    if (hovered.current) return
    apply(false, true)
  }, [apply, showText, addIcon])

  const onEnter = () => {
    hovered.current = true
    apply(true, false)
  }

  const onLeave = () => {
    hovered.current = false
    apply(false, false)
    // release a press the pointer carried off the button
    if (scope.current)
      animate(scope.current, { scale: 1 } as DOMKeyframesDefinition, opts())
  }

  // Keyboard parity: a tabbed-to button showed nothing but the browser's
  // focus ring, so the label and icon states were mouse-only. `:focus-visible`
  // keeps a mouse click from double-triggering what onEnter already ran.
  const onFocus = (e: React.FocusEvent<HTMLElement>) => {
    if (e.currentTarget.matches(":focus-visible")) onEnter()
  }

  const onBlur = () => {
    if (hovered.current) onLeave()
  }

  const isLink = typeof link === "string" && link.length > 0
  // A genuinely polymorphic "Tag": React.ElementType is the standard typing
  // for a runtime-chosen intrinsic element, so props can still be spread
  // onto it without falling back to `any`.
  const Tag: React.ElementType = isLink ? "a" : "button"
  const tagProps: React.AnchorHTMLAttributes<HTMLAnchorElement> &
    React.ButtonHTMLAttributes<HTMLButtonElement> = {
    // With the text hidden the button has no accessible name — the icon is
    // decorative — so Label keeps working as one.
    "aria-label": showText ? undefined : label || undefined,
    ...(isLink
      ? {
          href: link,
          target: newTab ? "_blank" : undefined,
          rel: newTab ? "noopener noreferrer" : undefined,
        }
      : { type: "button" }),
  }

  // Symbol or image, whichever the Type switch selects. Image mode falls back
  // to the symbol until a picture is actually chosen — otherwise flipping the
  // switch would empty the badge and read as a broken control. A symbol that
  // matches one of the eight compass arrows renders as SVG (see
  // ARROW_ANGLES) rather than text, since that's the only way to center the
  // ink itself instead of the font's lopsided advance box around it.
  const renderIcon = (symbol: string, image: FramerImageValue) => {
    const src = srcOf(image)
    if (iconType === "image" && src)
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          aria-hidden
          draggable={false}
          style={{
            width: glyphSize,
            height: glyphSize,
            objectFit: iconRadius > 0 ? "cover" : "contain",
            borderRadius: Math.min(iconRadius, glyphSize / 2),
            display: "block",
            pointerEvents: "none",
          }}
        />
      )

    const arrowAngle = iconType === "symbol" ? arrowAngleOf(symbol) : undefined
    if (arrowAngle !== undefined) {
      // Base path is drawn pointing up-right (315°, matching the badge's
      // own default Movement Angle) with its diagonal's midpoint at
      // (12, 12) — the exact center of the 24×24 viewBox. Rotating that
      // fixed, symmetric drawing to any other compass direction keeps the
      // same guarantee; rotating font text would not, since a glyph's
      // ink shifts around unpredictably between fonts and directions.
      const rotation = arrowAngle - 315
      return (
        <svg
          width={glyphSize}
          height={glyphSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            display: "block",
            transform: `rotate(${rotation}deg)`,
            pointerEvents: "none",
          }}
        >
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      )
    }

    return (
      // Fills the flex-centered wrapper edge-to-edge and centers the
      // glyph AS a flex item's inline content. Kept only for symbols
      // outside the arrow set (letters, "+", emoji, …); it still carries
      // the same font-metric caveat the arrow path above exists to avoid.
      <span
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: glyphSize,
          lineHeight: 1,
          // The badge owns the tint; the symbol inherits it so one
          // animated colour drives both.
          color: "currentColor",
          // Font controls belong to the label, not the glyph.
          fontFamily: "inherit",
          whiteSpace: "nowrap",
        }}
      >
        {symbol}
      </span>
    )
  }

  return (
    <Tag
      {...tagProps}
      ref={scope}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onPointerCancel={onLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onPointerDown={() =>
        scope.current &&
        animate(
          scope.current,
          { scale: 0.97 } as DOMKeyframesDefinition,
          opts()
        )
      }
      onPointerUp={() =>
        scope.current &&
        animate(scope.current, { scale: 1 } as DOMKeyframesDefinition, opts())
      }
      style={{
        display: "inline-flex",
        flexDirection: iconPosition === "left" ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: "center",
        // Gap only means something with two children.
        gap: showText && addIcon ? `${gap}px` : 0,
        padding,
        // borderRadius, backgroundColor, color and borderColor are all
        // set imperatively — borderRadius because it is a percent of the
        // measured box, the colours because they are animated. Declaring
        // any of them here would let React clobber the live value on a
        // re-render (editing a control mid-hover snaps it back to rest).
        ...borderBoxOf(border),
        textDecoration: "none",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        // No boxShadow: Framer's own layer Effects already add one to
        // any instance, so a prop here would be a second, competing dial.
        userSelect: "none",
        boxSizing: "border-box",
        willChange: "transform",
        ...fontStyles,
        // Floor goes before the spread so Framer's injected size still
        // wins whenever the canvas sets an explicit width/height — this
        // only stops the button collapsing when nothing else is sizing it.
        minWidth: "min-content",
        minHeight: "min-content",
        ...style,
      }}
    >
      {showText && (
        <span
          style={{
            position: "relative",
            display: "inline-block",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {/* Invisible spacer: sets the stack's own box to the
                        label's natural size so the two absolutely positioned
                        copies below have something to sit inside. */}
          <span style={{ visibility: "hidden" }}>{label}</span>
          <span
            ref={labelUpRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {label}
          </span>
          <span
            ref={labelDownRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translateY(${labelEnter})`,
            }}
          >
            {label}
          </span>
        </span>
      )}

      {addIcon && (
        <span
          ref={badgeRef}
          style={{
            position: "relative",
            flexShrink: 0,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeRadius,
            overflow: "hidden",
          }}
        >
          <span
            ref={iconOutRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {renderIcon(restSymbol, restImage)}
          </span>
          <span
            ref={iconInRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
            }}
          >
            {renderIcon(hoverSymbol, hoverImage)}
          </span>
        </span>
      )}
    </Tag>
  )
}

const __originkitPresetProps: Partial<AnimatedButtonProps> = {
  textSide: "bottom",
  rounded: 31,
  icon: {
    side: "left",
    size: 16,
    type: "symbol",
    angle: 315,
    color: "#FFFFFF",
    padding: 8,
    rounded: 100,
    restImage: "",
    background: "#222222",
    hoverColor: "#000000",
    hoverImage: "",
    restSymbol: "↗",
    hoverSymbol: "↗",
    hoverBackground: "#FFFFFF",
  },
}

export default function LabelSlideButtonPreset(props: AnimatedButtonProps) {
  return <LabelSlideButton {...__originkitPresetProps} {...props} />
}
