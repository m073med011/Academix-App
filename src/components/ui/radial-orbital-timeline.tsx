"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  Code,
  FileText,
  GraduationCap,
  Layout,
  Link,
  Shield,
  User,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[]
  dictionary?: any
}

export default function RadialOrbitalTimeline({
  timelineData,
  dictionary,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  )
  const [viewMode, setViewMode] = useState<"orbital">("orbital")
  const [rotationAngle, setRotationAngle] = useState<number>(0)
  const [autoRotate, setAutoRotate] = useState<boolean>(true)
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({})
  const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const orbitRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // Default Platform Info
  const defaultInfo = {
    title: dictionary?.defaultInfo?.title || "The Academix Ecosystem",
    description:
      dictionary?.defaultInfo?.description || "A next-generation ecosystem connecting ambitous learners, expert instructors, and forward-thinking organizations. Unlock potential with AI-driven pathways, secure credentials, and global opportunities.",
    stats: [
      { label: dictionary?.defaultInfo?.stats?.activeRoles || "Active Roles", value: "5" },
      { label: dictionary?.defaultInfo?.stats?.possibilities || "Possibilities", value: "∞" },
      { label: dictionary?.defaultInfo?.stats?.impact || "Impact", value: dictionary?.defaultInfo?.stats?.global || "Global" },
    ],
  }

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only reset if clicking strictly outside of nodes
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({})
      setActiveNodeId(null)
      setPulseEffect({})
      setAutoRotate(true)
    }
  }

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState: Record<number, boolean> = {} // Close others

      // If clicking the same one, toggle it
      // If clicking a new one, open it
      const isCurrentlyOpen = prev[id]

      if (!isCurrentlyOpen) {
        newState[id] = true
        setActiveNodeId(id)
        setAutoRotate(false)
        centerViewOnNode(id)
      } else {
        setActiveNodeId(null)
        setAutoRotate(true)
      }

      return newState
    })
  }

  useEffect(() => {
    let rotationTimer: NodeJS.Timeout

    if (autoRotate && viewMode === "orbital") {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.2) % 360 // Slower rotation for larger size
          return Number(newAngle.toFixed(3))
        })
      }, 50)
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer)
      }
    }
  }, [autoRotate, viewMode])

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId)
    const totalNodes = timelineData.length

    // We want the selected node to be roughly at 3 o'clock (0 degrees) or 9 o'clock?
    // Let's aim for 0 degrees (Right side) so it faces the text on the left?
    // Actually, text is on the Left. So node should be on the Right (0 deg) or Left (180 deg)?
    // If text is on Left, maybe it looks best if node is on the Right (0 degrees) or tilted.
    // Let's target 0 degrees (Right).
    // Node angle = (index / total) * 360 + rotationAngle
    // We want Node angle % 360 = 0
    // => rotationAngle = - (index / total) * 360

    const targetAngle = -((nodeIndex / totalNodes) * 360)
    // We need to animate to this, but for now snap or set.
    // Normalized to 0-360
    const normalizedTarget = ((targetAngle % 360) + 360) % 360

    setRotationAngle(normalizedTarget)
  }

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360
    // Increased radius: 300px for desktop
    // We should make this responsive.
    // 300px radius = 600px diameter.
    const radius = 300
    const radian = (angle * Math.PI) / 180

    const x = radius * Math.cos(radian)
    const y = radius * Math.sin(radian)

    const zIndex = Math.round(100 + 50 * Math.cos(radian))
    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.cos(radian)) / 2)) // Fade out items in back
    )

    return { x, y, angle, zIndex, opacity }
  }

  const activeItem = activeNodeId
    ? timelineData.find((i) => i.id === activeNodeId)
    : null

  return (
    <div
      className="w-full flex flex-col lg:flex-row items-center justify-center bg-transparent overflow-hidden"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      {/* Left Col: Text Content */}
      <div className="w-full lg:w-1/2 p-8 lg:pl-20 z-20 pointer-events-none flex flex-col justify-center  ">
        <div className="pointer-events-auto w-full max-w-xl">
          <AnimatePresence mode="wait">
            {activeItem ? (
              <motion.div
                key={`info-${activeItem.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-black/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl"
              >
                <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30">
                  {activeItem.category}
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {activeItem.title}
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  {activeItem.content}
                </p>

                {activeItem.features && (
                  <ul className="grid grid-cols-1 gap-2 mb-8">
                    {activeItem.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>{dictionary?.impact || "Impact"}: {activeItem.energy}%</span>
                  </div>
                  <div className="w-px h-4 bg-white/20" />
                  <div>
                    {activeItem.status === "completed"
                      ? dictionary?.availableNow || "Available Now"
                      : dictionary?.comingSoon || "Coming Soon"}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="default-info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-4"
              >
                <h2 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-linear-to-br from-white to-gray-500 mb-6">
                  {defaultInfo.title}
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed max-w-lg mb-8">
                  {defaultInfo.description}
                </p>
                <div className="grid grid-cols-3 gap-6">
                  {defaultInfo.stats.map((stat, i) => (
                    <div key={i}>
                      <div className="text-3xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-400 uppercase tracking-wider">
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

      {/* Right Col: Orbital Visualization */}
      <div className="w-full lg:w-1/2 h-[50vh] lg:h-screen relative flex items-center justify-center perspective-1000 overflow-hidden">
        {/* Scale Wrapper for Responsiveness */}
        <div className="relative w-full h-full flex items-center justify-center transform scale-[0.45] sm:scale-60 md:scale-75 lg:scale-90 xl:scale-100 origin-center transition-transform duration-500">
          <div
            className="absolute flex items-center justify-center"
            ref={orbitRef}
            style={{
              transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
            }}
          >
            {/* Central Core */}
            <div className="absolute w-32 h-32 rounded-full bg-linear-to-br from-indigo-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-3xl animate-pulse z-0 blur-xl"></div>
              <Image
                src="/images/logos/logo02.png"
                alt="Academix"
                height={80}
                width={80}
                className="dark:invert"
              />

            {/* Orbital Rings */}
            <div className="absolute w-[600px] h-[600px] rounded-full border border-white/5 animate-[spin_60s_linear_infinite]"></div>
            <div className="absolute w-[450px] h-[450px] rounded-full border border-dashed border-white/10 animate-[spin_40s_linear_infinite_reverse]"></div>

            {/* Nodes */}
            {timelineData.map((item, index) => {
              const position = calculateNodePosition(index, timelineData.length)
              const isExpanded = expandedItems[item.id]

              const Icon = iconMap[item.icon] || Calendar

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    nodeRefs.current[item.id] = el
                  }}
                  className="absolute cursor-pointer transition-all duration-500 ease-out"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    zIndex: position.zIndex,
                    opacity: position.opacity,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleItem(item.id)
                  }}
                >
                  {/* Node Visual */}
                  <div
                    className={`
                                        relative flex items-center justify-center
                                        transition-all duration-300
                                        ${isExpanded ? "w-24 h-24" : "w-16 h-16"}
                                    `}
                  >
                    {/* Pulse effect when selected */}
                    {isExpanded && (
                      <div className="absolute inset-0 rounded-full bg-white/10 animate-ping"></div>
                    )}

                    <div
                      className={`
                                        relative w-full h-full rounded-full flex items-center justify-center
                                        border shadow-2xl backdrop-blur-md
                                        ${
                                          isExpanded
                                            ? "bg-white text-black border-white scale-110"
                                            : "bg-black/60 text-white border-white/20 hover:border-white/60 hover:bg-black/80"
                                        }
                                        transition-all duration-300
                                    `}
                    >
                      <Icon size={isExpanded ? 32 : 20} strokeWidth={1.5} />
                    </div>

                    {/* Label underneath */}
                    {!isExpanded && (
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-white/50 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.title}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
