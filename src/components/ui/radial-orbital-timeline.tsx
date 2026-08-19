"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  Briefcase,
  Calendar,
  Clock,
  Code,
  FileText,
  GraduationCap,
  Layout,
  Shield,
  User,
  Users,
  Zap,
} from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

interface TimelineItem {
  id: number
  title: string
  date: string
  content: string
  category: string
  icon: string
  relatedIds: number[]
  status: "completed" | "in-progress" | "pending"
  energy: number
  features?: string[]
}

type RadialDictionary = DictionaryType["landingPage"]["radialTimeline"]

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[]
  dictionary?: RadialDictionary
  direction?: "ltr" | "rtl"
}

interface RoleDetailsProps {
  item: TimelineItem
  dictionary?: RadialDictionary
  direction: "ltr" | "rtl"
  compact?: boolean
  reduceMotion?: boolean
}

const iconMap: Record<string, LucideIcon> = {
  calendar: Calendar,
  code: Code,
  fileText: FileText,
  user: User,
  clock: Clock,
  graduationCap: GraduationCap,
  briefcase: Briefcase,
  shield: Shield,
  users: Users,
  layout: Layout,
}

function RoleDetails({
  item,
  dictionary,
  direction,
  compact = false,
  reduceMotion = false,
}: RoleDetailsProps) {
  const enterX = direction === "rtl" ? 20 : -20

  return (
    <motion.article
      key={`info-${item.id}`}
      initial={reduceMotion ? false : { opacity: 0, x: enterX }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: enterX }}
      transition={{ duration: reduceMotion ? 0 : 0.25 }}
      className={
        compact
          ? "rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-md sm:p-6"
          : "rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur-md xl:p-8"
      }
    >
      <Badge className="mb-4 border-blue-500/30 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30">
        {item.category}
      </Badge>
      <h3
        className={
          compact
            ? "mb-4 text-2xl leading-tight font-bold text-balance text-white sm:text-3xl"
            : "mb-5 text-3xl leading-tight font-bold text-balance text-white xl:text-5xl"
        }
      >
        {item.title}
      </h3>
      <p className="mb-5 text-sm leading-relaxed text-gray-300 sm:text-base xl:text-lg">
        {item.content}
      </p>

      {item.features && (
        <ul className="mb-6 grid grid-cols-1 gap-2.5">
          {item.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-400 sm:text-base"
            >
              <span
                className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-blue-400/70"
                aria-hidden="true"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <Zap className="size-4 text-yellow-400" aria-hidden="true" />
          <span>
            {dictionary?.impact || "Impact"}: {item.energy}%
          </span>
        </span>
        <span className="hidden h-4 w-px bg-white/20 sm:block" />
        <span>
          {item.status === "completed"
            ? dictionary?.availableNow || "Available Now"
            : dictionary?.comingSoon || "Coming Soon"}
        </span>
      </div>
    </motion.article>
  )
}

export default function RadialOrbitalTimeline({
  timelineData,
  dictionary,
  direction = "ltr",
}: RadialOrbitalTimelineProps) {
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null)
  const [rotationAngle, setRotationAngle] = useState(0)
  const [orbitSize, setOrbitSize] = useState({ width: 640, height: 640 })
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const orbitViewportRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion() ?? false

  const defaultInfo = useMemo(
    () => ({
      title: dictionary?.defaultInfo?.title || "The Academix Ecosystem",
      description:
        dictionary?.defaultInfo?.description ||
        "A connected ecosystem for learners, instructors, and organizations.",
      stats: [
        {
          label: dictionary?.defaultInfo?.stats?.activeRoles || "Active Roles",
          value: timelineData.length.toString(),
        },
        {
          label:
            dictionary?.defaultInfo?.stats?.possibilities || "Possibilities",
          value: "∞",
        },
        {
          label: dictionary?.defaultInfo?.stats?.impact || "Impact",
          value: dictionary?.defaultInfo?.stats?.global || "Global",
        },
      ],
    }),
    [dictionary, timelineData.length]
  )

  const activeItem = activeNodeId
    ? timelineData.find((item) => item.id === activeNodeId) || null
    : null

  useEffect(() => {
    const element = orbitViewportRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      setOrbitSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "120px", threshold: 0.05 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (activeNodeId || reduceMotion || !isVisible) return

    const rotationTimer = window.setInterval(() => {
      setRotationAngle((angle) => Number(((angle + 0.35) % 360).toFixed(3)))
    }, 100)

    return () => window.clearInterval(rotationTimer)
  }, [activeNodeId, isVisible, reduceMotion])

  const orbitRadius = Math.max(
    150,
    Math.min(280, Math.min(orbitSize.width, orbitSize.height) * 0.34)
  )

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360
    const radian = (angle * Math.PI) / 180

    return {
      x: orbitRadius * Math.cos(radian),
      y: orbitRadius * Math.sin(radian),
      zIndex: Math.round(100 + 50 * Math.cos(radian)),
      opacity: Math.max(
        0.5,
        Math.min(1, 0.5 + 0.5 * ((1 + Math.cos(radian)) / 2))
      ),
    }
  }

  const toggleItem = (id: number) => {
    const willClose = activeNodeId === id
    setActiveNodeId(willClose ? null : id)

    if (!willClose) {
      const nodeIndex = timelineData.findIndex((item) => item.id === id)
      const targetAngle = -((nodeIndex / timelineData.length) * 360)
      setRotationAngle(((targetAngle % 360) + 360) % 360)
    }
  }

  return (
    <section
      ref={sectionRef}
      aria-label={defaultInfo.title}
      className="w-full overflow-hidden bg-transparent px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="lg:hidden">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl leading-tight font-bold text-balance text-white sm:text-5xl">
              {defaultInfo.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-lg">
              {defaultInfo.description}
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-5">
              {defaultInfo.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-black/25 px-3 py-4"
                >
                  <div className="text-2xl font-bold text-white sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs leading-relaxed tracking-wide text-gray-400 uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            role="group"
            aria-label={defaultInfo.title}
            className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-5"
          >
            {timelineData.map((item) => {
              const Icon = iconMap[item.icon] || Calendar
              const isActive = activeNodeId === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isActive}
                  aria-controls="mobile-role-details"
                  onClick={() => toggleItem(item.id)}
                  className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none last:col-span-2 sm:last:col-span-1 ${
                    isActive
                      ? "border-white bg-white text-black"
                      : "border-white/15 bg-black/40 text-white hover:border-white/40 hover:bg-black/60"
                  }`}
                >
                  <Icon
                    className="size-5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-tight font-semibold">
                    {item.title}
                  </span>
                  <span
                    className={`text-xs ${isActive ? "text-black/65" : "text-white/55"}`}
                  >
                    {item.date}
                  </span>
                </button>
              )
            })}
          </div>

          <div
            id="mobile-role-details"
            aria-live="polite"
            className="mx-auto mt-5 min-h-0 max-w-3xl sm:mt-6"
          >
            <AnimatePresence mode="wait">
              {activeItem && (
                <RoleDetails
                  key={activeItem.id}
                  item={activeItem}
                  dictionary={dictionary}
                  direction={direction}
                  compact
                  reduceMotion={reduceMotion}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden min-h-[42rem] items-center gap-8 lg:grid lg:grid-cols-2 xl:gap-12">
          <div className="relative z-20 flex min-w-0 items-center">
            <div className="w-full max-w-xl">
              <AnimatePresence mode="wait">
                {activeItem ? (
                  <RoleDetails
                    key={activeItem.id}
                    item={activeItem}
                    dictionary={dictionary}
                    direction={direction}
                    reduceMotion={reduceMotion}
                  />
                ) : (
                  <motion.div
                    key="default-info"
                    initial={
                      reduceMotion
                        ? false
                        : {
                            opacity: 0,
                            x: direction === "rtl" ? 20 : -20,
                          }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      reduceMotion
                        ? undefined
                        : {
                            opacity: 0,
                            x: direction === "rtl" ? 20 : -20,
                          }
                    }
                    transition={{ duration: reduceMotion ? 0 : 0.25 }}
                    className="p-2 xl:p-4"
                  >
                    <h2 className="text-5xl leading-[1.05] font-bold text-balance text-white xl:text-7xl">
                      {defaultInfo.title}
                    </h2>
                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-300 xl:text-xl">
                      {defaultInfo.description}
                    </p>
                    <div className="mt-8 grid grid-cols-3 gap-4 xl:gap-6">
                      {defaultInfo.stats.map((stat) => (
                        <div key={stat.label} className="min-w-0">
                          <div className="text-3xl font-bold text-white">
                            {stat.value}
                          </div>
                          <div className="mt-1 break-words text-xs leading-relaxed tracking-wide text-gray-400 uppercase xl:text-sm">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div
            ref={orbitViewportRef}
            className="relative flex h-[42rem] min-w-0 items-center justify-center overflow-hidden xl:h-[46rem]"
          >
            <div className="absolute flex items-center justify-center">
              <div className="absolute z-0 size-32 animate-pulse rounded-full bg-blue-500/15 blur-2xl motion-reduce:animate-none" />
              <Image
                src="/images/logos/logo02.png"
                alt="Academix"
                height={80}
                width={80}
                className="relative z-10 dark:invert"
              />

              <div
                className="absolute animate-[spin_60s_linear_infinite] rounded-full border border-white/10 motion-reduce:animate-none"
                style={{
                  width: orbitRadius * 2,
                  height: orbitRadius * 2,
                }}
              />
              <div
                className="absolute animate-[spin_40s_linear_infinite_reverse] rounded-full border border-dashed border-white/10 motion-reduce:animate-none"
                style={{
                  width: orbitRadius * 1.5,
                  height: orbitRadius * 1.5,
                }}
              />

              {timelineData.map((item, index) => {
                const position = calculateNodePosition(
                  index,
                  timelineData.length
                )
                const isActive = activeNodeId === item.id
                const Icon = iconMap[item.icon] || Calendar

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`${item.title}: ${item.date}`}
                    aria-pressed={isActive}
                    onClick={() => toggleItem(item.id)}
                    className="group absolute cursor-pointer rounded-full transition-[transform,opacity] duration-500 ease-out focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:outline-none motion-reduce:transition-none"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px)`,
                      zIndex: position.zIndex,
                      opacity: position.opacity,
                    }}
                  >
                    <span
                      className={`relative flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 motion-reduce:transition-none ${
                        isActive
                          ? "size-20 scale-110 border-white bg-white text-black"
                          : "size-16 border-white/20 bg-black/65 text-white hover:border-white/60 hover:bg-black/85"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-white/10 motion-reduce:animate-none" />
                      )}
                      <Icon
                        size={isActive ? 30 : 22}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span className="pointer-events-none absolute -bottom-8 start-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium tracking-wide text-white/70 transition-opacity group-hover:text-white group-focus-visible:text-white rtl:translate-x-1/2">
                        {item.title}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
