"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip"

interface FlipCardProps {
  src: string
  index: number
  target: {
    x: number
    y: number
    rotation: number
    scale: number
    opacity: number
  }
  dimensions: { width: number; height: number }
  reduceMotion: boolean
  isInteractive: boolean
  onClick: (src: string) => void
  dictionary?: any
}

function FlipCard({
  src,
  index,
  target,
  dimensions,
  reduceMotion,
  isInteractive,
  onClick,
  dictionary,
}: FlipCardProps) {
  return (
    <motion.button
      type="button"
      aria-label={`${dictionary?.cardFeature || "Learning feature"} ${index + 1}`}
      aria-hidden={!isInteractive}
      tabIndex={isInteractive ? 0 : -1}
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 40, damping: 15 }
      }
      style={{
        position: "absolute",
        width: dimensions.width,
        height: dimensions.height,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="group cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
      onClick={(e) => {
        e.stopPropagation()
        onClick(src)
      }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 0.6,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }
        }
        whileHover={reduceMotion ? undefined : { rotateY: 180 }}
        whileFocus={reduceMotion ? undefined : { rotateY: 180 }}
      >
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl bg-gray-200 shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src={src}
            alt=""
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
        </div>

        <div
          className="absolute inset-0 flex h-full w-full items-center justify-center rounded-xl border border-gray-700 bg-gray-900 shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="px-3 text-center sm:px-4">
            <p className="mb-1 text-[0.625rem] font-bold tracking-widest text-blue-400 uppercase sm:mb-1.5 sm:text-xs">
              {dictionary?.cardFeature || "Learning Feature"}
            </p>
            <p className="text-xs font-medium text-white sm:text-sm lg:text-base">
              {dictionary?.cardCapability || "Structured Capability"}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.button>
  )
}

const MAX_SCROLL = 3000

const IMAGES = [
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
  "https://images.unsplash.com/photo-1584697964192-4c5a3c1b3b0a?w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  "https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?w=800&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  "https://images.unsplash.com/photo-1581091870627-3c9c1f9b6b8c?w=800&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
  "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&q=80",
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
  "https://images.unsplash.com/photo-1603575448365-8b6b2a3c6c28?w=800&q=80",
  "https://images.unsplash.com/photo-1556761175-129418cb2dfe?w=800&q=80",
  "https://images.unsplash.com/photo-1600267165630-90d7b8b42c63?w=800&q=80",
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
]
const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t

interface IntroAnimationProps {
  dictionary?: any
  closeLabel?: string
}

export default function IntroAnimation({
  dictionary,
  closeLabel = "Close",
}: IntroAnimationProps) {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter")
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const reduceMotion = useReducedMotion() ?? false

  const trackRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)

  // Resize observer
  useEffect(() => {
    if (!stickyRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })
    observer.observe(stickyRef.current)
    return () => observer.disconnect()
  }, [])

  // Scroll
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  })

  const virtualScroll = useTransform(scrollYProgress, [0, 1], [0, MAX_SCROLL])
  const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1])
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 })

  const scrollRotate = useTransform(virtualScroll, [600, 3000], [0, 360])
  const smoothRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 })

  // Mouse parallax
  const mouseX = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 })

  useEffect(() => {
    const el = stickyRef.current
    if (!el || reduceMotion) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      mouseX.set((x * 2 - 1) * 100)
    }
    el.addEventListener("mousemove", onMove)
    return () => el.removeEventListener("mousemove", onMove)
  }, [mouseX, reduceMotion])

  // Intro timing
  useEffect(() => {
    if (reduceMotion) {
      setIntroPhase("circle")
      return
    }

    const t1 = setTimeout(() => setIntroPhase("line"), 500)
    const t2 = setTimeout(() => setIntroPhase("circle"), 2500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [reduceMotion])

  const scatterPositions = useMemo(
    () =>
      IMAGES.map((_, index) => {
        const angle = ((index * 137.5 + 17) * Math.PI) / 180
        const radius = 780 + (index % 5) * 130

        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius * 0.65,
          rotation: ((index * 47) % 180) - 90,
          scale: 0.6,
          opacity: 0,
        }
      }),
    []
  )

  // Live values
  const [morphValue, setMorphValue] = useState(0)
  const [rotateValue, setRotateValue] = useState(0)
  const [parallaxValue, setParallaxValue] = useState(0)

  const cardDimensions = useMemo(() => {
    if (
      (containerSize.width > 0 && containerSize.width < 480) ||
      (containerSize.height > 0 && containerSize.height < 460)
    ) {
      return { width: 96, height: 72 }
    }
    if (
      (containerSize.width > 0 && containerSize.width < 768) ||
      (containerSize.height > 0 && containerSize.height < 640)
    ) {
      return { width: 120, height: 90 }
    }
    return { width: 160, height: 120 }
  }, [containerSize.height, containerSize.width])

  const compactLayout =
    containerSize.width === 0 ||
    containerSize.width < 640 ||
    containerSize.height < 560
  const visibleImages = compactLayout ? IMAGES.slice(0, 8) : IMAGES

  useEffect(() => {
    if (reduceMotion) return

    const u1 = smoothMorph.on("change", setMorphValue)
    const u2 = smoothRotate.on("change", setRotateValue)
    const u3 = smoothMouseX.on("change", setParallaxValue)
    return () => {
      u1()
      u2()
      u3()
    }
  }, [reduceMotion, smoothMorph, smoothMouseX, smoothRotate])

  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1])
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0])

  if (reduceMotion) {
    return (
      <div ref={trackRef} className="w-full px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto w-full max-w-5xl text-center">
          <p className="text-xs tracking-[0.16em] text-gray-400 uppercase">
            {dictionary?.subtitle || "How learning works"}
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl leading-tight font-semibold text-balance text-white sm:text-5xl">
            {dictionary?.activeTitle || "A Learning System Built for Outcomes"}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
            {dictionary?.activeDescription ||
              "Structured programs, real projects, and measurable progress."}
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {IMAGES.slice(0, 6).map((src) => (
              <div
                key={src}
                className="aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-gray-900"
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={trackRef}
      className="relative h-[260svh] w-full sm:h-[280svh] lg:h-[300svh]"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="pointer-events-none absolute z-20 max-w-3xl px-5 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                  : { opacity: 0 }
              }
              className="text-2xl leading-tight font-medium text-balance text-white [text-shadow:0_2px_18px_rgb(0_0_0/0.95)] sm:text-3xl md:text-4xl"
            >
              {dictionary?.title ||
                "Learn skills. Build competence. Advance with clarity."}
            </motion.h2>
            <motion.p
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 0.5 - morphValue }
                  : { opacity: 0 }
              }
              className="mt-4 text-[0.625rem] tracking-[0.14em] text-gray-300 [text-shadow:0_2px_12px_rgb(0_0_0/1)] sm:text-xs sm:tracking-[0.2em]"
            >
              {dictionary?.subtitle || "SCROLL TO SEE HOW LEARNING WORKS"}
            </motion.p>
          </div>

          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="pointer-events-none absolute top-[max(6rem,12%)] z-30 w-full max-w-3xl px-5 text-center sm:top-[max(6.5rem,10%)] sm:px-6"
          >
            <h2 className="mb-3 text-2xl leading-tight font-semibold text-balance text-white sm:mb-4 sm:text-3xl md:text-5xl">
              {dictionary?.activeTitle ||
                "A Learning System Built for Outcomes"}
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-300 md:text-base">
              {dictionary?.activeDescription ||
                "Structured programs, real projects, and measurable progress. Designed for students, professionals, and organizations that value results."}
            </p>
          </motion.div>

          <div className="relative z-10 flex h-full w-full items-center justify-center">
            {visibleImages.map((src, i) => {
              let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }
              const totalImages = visibleImages.length

              if (introPhase === "scatter") {
                target = scatterPositions[i]
              } else if (introPhase === "line") {
                const spacing = cardDimensions.width + 10
                const totalWidth = (totalImages - 1) * spacing
                target = {
                  x: i * spacing - totalWidth / 2,
                  y: 0,
                  rotation: 0,
                  scale: 1,
                  opacity: 1,
                }
              } else {
                const minDim = Math.min(
                  containerSize.width,
                  containerSize.height
                )
                const circleScale = compactLayout ? 0.62 : 1
                const horizontalRadius = Math.max(
                  88,
                  (containerSize.width - cardDimensions.width * circleScale) /
                    2 -
                    10
                )
                const verticalRadius = Math.max(
                  88,
                  (containerSize.height - cardDimensions.height * circleScale) /
                    2 -
                    20
                )
                const circleRadius = Math.min(
                  horizontalRadius,
                  verticalRadius,
                  480
                )

                const angle = (i / totalImages) * 360
                const rad = (angle * Math.PI) / 180

                const circle = {
                  x: Math.cos(rad) * circleRadius,
                  y: Math.sin(rad) * circleRadius,
                  rotation: angle + 90,
                }

                const spread = compactLayout ? 132 : 200
                const start = -90 - spread / 2
                const step = spread / (totalImages - 1)

                const scrollProgress = Math.min(
                  Math.max(rotateValue / 360, 0),
                  1
                )
                const bounded = -scrollProgress * spread * 0.8
                const arcAngle = start + i * step + bounded
                const arcRad = (arcAngle * Math.PI) / 180

                const arcRadius = minDim * (compactLayout ? 1.05 : 1.2)
                const arcCenterY = containerSize.height * 0.32 + arcRadius

                const arc = {
                  x:
                    Math.cos(arcRad) * arcRadius +
                    (reduceMotion ? 0 : parallaxValue),
                  y: Math.sin(arcRad) * arcRadius + arcCenterY,
                  rotation: arcAngle + 90,
                  scale: compactLayout
                    ? 1.12
                    : containerSize.width < 1024
                      ? 1.3
                      : 1.5,
                }

                target = {
                  x: lerp(circle.x, arc.x, morphValue),
                  y: lerp(circle.y, arc.y, morphValue),
                  rotation: lerp(circle.rotation, arc.rotation, morphValue),
                  scale: lerp(circleScale, arc.scale, morphValue),
                  opacity: 1,
                }
              }

              return (
                <FlipCard
                  key={i}
                  src={src}
                  index={i}
                  target={target}
                  dimensions={cardDimensions}
                  reduceMotion={reduceMotion}
                  isInteractive={
                    target.opacity > 0.1 &&
                    Math.abs(target.x) <
                      containerSize.width / 2 + cardDimensions.width / 2 &&
                    Math.abs(target.y) <
                      containerSize.height / 2 + cardDimensions.height / 2
                  }
                  onClick={setActiveImage}
                  dictionary={dictionary}
                />
              )
            })}
          </div>

          <Dialog
            open={Boolean(activeImage)}
            onOpenChange={(open) => {
              if (!open) setActiveImage(null)
            }}
          >
            <DialogContent
              aria-describedby={undefined}
              closeLabel={closeLabel}
              className="max-h-[90svh] max-w-[calc(100%-1.5rem)] overflow-hidden border-white/10 bg-gray-950 p-0 text-white sm:max-w-4xl"
            >
              <DialogTitle className="sr-only">
                {dictionary?.cardFeature || "Learning image preview"}
              </DialogTitle>
              {activeImage && (
                <img
                  src={activeImage}
                  alt=""
                  className="max-h-[85svh] w-full object-contain"
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
