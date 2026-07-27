"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion"

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip"

interface FlipCardProps {
  src: string
  index: number
  total: number
  phase: AnimationPhase
  target: {
    x: number
    y: number
    rotation: number
    scale: number
    opacity: number
  }
  onClick: (src: string) => void
  dictionary?: any
}

// --- FlipCard Component ---
const IMG_WIDTH = 160
const IMG_HEIGHT = 120

function FlipCard({ src, index, target, onClick, dictionary }: FlipCardProps) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{ type: "spring", stiffness: 40, damping: 15 }}
      style={{
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="cursor-pointer group"
      onClick={(e) => {
        e.stopPropagation() // Prevent triggering parent clicks if any
        onClick(src)
      }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-200"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img src={src} alt={`learning-${index}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 h-full w-full rounded-xl shadow-lg bg-gray-900 flex items-center justify-center border border-gray-700"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-center px-4">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1.5">
              {dictionary?.cardFeature || "Learning Feature"}
            </p>
            <p className="text-base font-medium text-white">
              {dictionary?.cardCapability || "Structured Capability"}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// --- Constants ---
const TOTAL_IMAGES = 20
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
}

export default function IntroAnimation({ dictionary }: IntroAnimationProps) {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter")
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [activeImage, setActiveImage] = useState<string | null>(null)

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

  // Close modal on scroll
  useEffect(() => {
    if (!activeImage) return

    const handleScroll = () => {
      setActiveImage(null)
    }

    // Capture scrolling on the window
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [activeImage])

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
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      mouseX.set((x * 2 - 1) * 100)
    }
    el.addEventListener("mousemove", onMove)
    return () => el.removeEventListener("mousemove", onMove)
  }, [mouseX])

  // Intro timing
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase("line"), 500)
    const t2 = setTimeout(() => setIntroPhase("circle"), 2500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  // Scatter positions
  const scatterPositions = useMemo(
    () =>
      IMAGES.map(() => ({
        x: (Math.random() - 0.5) * 2200,
        y: (Math.random() - 0.5) * 1400,
        rotation: (Math.random() - 0.5) * 180,
        scale: 0.6,
        opacity: 0,
      })),
    []
  )

  // Live values
  const [morphValue, setMorphValue] = useState(0)
  const [rotateValue, setRotateValue] = useState(0)
  const [parallaxValue, setParallaxValue] = useState(0)

  useEffect(() => {
    const u1 = smoothMorph.on("change", setMorphValue)
    const u2 = smoothRotate.on("change", setRotateValue)
    const u3 = smoothMouseX.on("change", setParallaxValue)
    return () => {
      u1()
      u2()
      u3()
    }
  }, [smoothMorph, smoothRotate, smoothMouseX])

  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1])
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0])

  return (
    <div ref={trackRef} className="relative w-full h-[300vh]">
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="relative h-full w-full flex items-center justify-center">

          {/* Intro Text */}
          <div className="absolute z-0 text-center pointer-events-none">
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                  : { opacity: 0 }
              }
              className="text-2xl md:text-4xl font-medium text-white"
            >
              {dictionary?.title || "Learn skills. Build competence. Advance with clarity."}
            </motion.h1>
            <motion.p
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 0.5 - morphValue }
                  : { opacity: 0 }
              }
              className="mt-4 text-xs tracking-[0.2em] text-gray-400"
            >
              {dictionary?.subtitle || "SCROLL TO SEE HOW LEARNING WORKS"}
            </motion.p>
          </div>

          {/* Active Content */}
          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="absolute top-[10%] z-10 text-center px-4 pointer-events-none"
          >
            <h2 className="text-3xl md:text-5xl font-semibold text-white mb-4">
              {dictionary?.activeTitle || "A Learning System Built for Outcomes"}
            </h2>
            <p className="max-w-lg mx-auto text-gray-300 text-sm md:text-base">
              {dictionary?.activeDescription || "Structured programs, real projects, and measurable progress. Designed for students, professionals, and organizations that value results."}
            </p>
          </motion.div>

          {/* Cards */}
          <div className="relative w-full h-full flex items-center justify-center">
            {IMAGES.map((src, i) => {
              let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }

              if (introPhase === "scatter") {
                target = scatterPositions[i]
              } else if (introPhase === "line") {
                const spacing = 170
                const totalWidth = TOTAL_IMAGES * spacing
                target = {
                  x: i * spacing - totalWidth / 2,
                  y: 0,
                  rotation: 0,
                  scale: 1,
                  opacity: 1,
                }
              } else {
                const minDim = Math.min(containerSize.width, containerSize.height)
                const circleRadius = Math.min(minDim * 0.42, 480)

                const angle = (i / TOTAL_IMAGES) * 360
                const rad = (angle * Math.PI) / 180

                const circle = {
                  x: Math.cos(rad) * circleRadius,
                  y: Math.sin(rad) * circleRadius,
                  rotation: angle + 90,
                }

                const spread = containerSize.width < 768 ? 150 : 200
                const start = -90 - spread / 2
                const step = spread / (TOTAL_IMAGES - 1)

                const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1)
                const bounded = -scrollProgress * spread * 0.8
                const arcAngle = start + i * step + bounded
                const arcRad = (arcAngle * Math.PI) / 180

                const arcRadius = minDim * 1.2
                const arcCenterY = containerSize.height * 0.3 + arcRadius

                const arc = {
                  x: Math.cos(arcRad) * arcRadius + parallaxValue,
                  y: Math.sin(arcRad) * arcRadius + arcCenterY,
                  rotation: arcAngle + 90,
                  scale: 1.5,
                }

                target = {
                  x: lerp(circle.x, arc.x, morphValue),
                  y: lerp(circle.y, arc.y, morphValue),
                  rotation: lerp(circle.rotation, arc.rotation, morphValue),
                  scale: lerp(1, arc.scale, morphValue),
                  opacity: 1,
                }
              }

              return (
                <FlipCard
                  key={i}
                  src={src}
                  index={i}
                  total={TOTAL_IMAGES}
                  phase={introPhase}
                  target={target}
                  onClick={setActiveImage}
                  dictionary={dictionary}
                />
              )
            })}
          </div>

          {/* Modal Overlay */}
          <AnimatePresence>
            {activeImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => setActiveImage(null)}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative max-w-4xl max-h-[90vh] w-full overflow-hidden rounded-2xl shadow-2xl bg-gray-900"
                  onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
                >
                    <img 
                        src={activeImage} 
                        alt="Expanded view" 
                        className="w-full h-full object-contain max-h-[85vh]" 
                    />
                    <button 
                        onClick={() => setActiveImage(null)}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}