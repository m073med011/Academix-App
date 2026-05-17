"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/stores/cart-store"
import {
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
  AlignStartVertical,
  Check,
  MoonStar,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Settings,
  Sun,
  SunMoon,
} from "lucide-react"

import type { LocaleType, ModeType } from "@/types"

import { i18n } from "@/configs/i18n"
import { relocalizePathname } from "@/lib/i18n"

import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { NumericScrubber } from "@/components/ui/number-scrubber"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useSidebar } from "@/components/ui/sidebar"

const APPLY_DELAY = 5 // seconds

export function Customizer() {
  const { status } = useSession()
  const { settings, updateSettings, resetSettings } = useSettings()
  const { setOpen } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const dictionary = useCartStore((state) => state.dictionary)

  const locale = params.lang as LocaleType
  const direction = i18n.localeDirection[locale]

  // ─── Debounced color state ───────────────────────────────────────────
  const [previewColor, setPreviewColor] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [isEditingHex, setIsEditingHex] = useState(false)
  const [hexInput, setHexInput] = useState("")
  const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // The color to display in the UI (preview takes priority)
  const displayColor = previewColor ?? settings.primaryColor ?? "#2563eb"

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (applyTimerRef.current) clearTimeout(applyTimerRef.current)
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)
    }
  }, [])

  const startColorCountdown = useCallback(
    (color: string) => {
      // Set preview state (only updates the swatch, NOT the theme)
      setPreviewColor(color)
      setCountdown(APPLY_DELAY)

      // Clear existing timers
      if (applyTimerRef.current) clearTimeout(applyTimerRef.current)
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)

      // Tick the countdown every second
      tickIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // After APPLY_DELAY seconds, persist to settings
      applyTimerRef.current = setTimeout(() => {
        updateSettings({ ...settings, primaryColor: color })
        setPreviewColor(null)
        setCountdown(0)
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)
      }, APPLY_DELAY * 1000)
    },
    [settings, updateSettings]
  )

  // Immediately apply + cancel countdown
  const applyNow = useCallback(() => {
    if (!previewColor) return
    if (applyTimerRef.current) clearTimeout(applyTimerRef.current)
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)
    updateSettings({ ...settings, primaryColor: previewColor })
    setPreviewColor(null)
    setCountdown(0)
  }, [previewColor, settings, updateSettings])

  // Cancel preview — just clear the pending color
  const cancelPreview = useCallback(() => {
    if (applyTimerRef.current) clearTimeout(applyTimerRef.current)
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)
    setPreviewColor(null)
    setCountdown(0)
  }, [])

  const handleSetLocale = useCallback(
    (localeName: LocaleType) => {
      updateSettings({ ...settings, locale: localeName })
      router.push(relocalizePathname(pathname, localeName))
    },
    [settings, updateSettings, router, pathname]
  )

  const handleSetMode = useCallback(
    (modeName: ModeType) => {
      updateSettings({ ...settings, mode: modeName })
    },
    [settings, updateSettings]
  )

  const handleReset = useCallback(() => {
    // Clear any pending color preview
    if (applyTimerRef.current) clearTimeout(applyTimerRef.current)
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)
    setPreviewColor(null)
    setCountdown(0)
    resetSettings()
    router.push(relocalizePathname(pathname, "en"), { scroll: false })
  }, [resetSettings, router, pathname])

  if (status !== "authenticated") {
    return null
  }

  return (
    <Sheet>
      <SheetTrigger className="fixed bottom-10 end-0 z-50" asChild>
        <Button
          size="icon"
          className="rounded-e-none shadow-sm"
          aria-label="Customizer"
        >
          <Settings className="shrink-0 h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetPortal>
        <SheetContent className="p-0" side="start">
          <ScrollArea className="h-full p-4">
            <div className="flex flex-1 flex-col space-y-4">
              <SheetHeader>
                <SheetTitle>
                  {dictionary?.customizer?.title || "Customizer"}
                </SheetTitle>
                <SheetDescription>
                  {dictionary?.customizer?.description ||
                    "Pick a style and color for the dashboard."}
                </SheetDescription>
              </SheetHeader>

              {/* Color Picker */}
              <div className="space-y-1.5">
                <p className="text-sm px-0.5">
                  {dictionary?.customizer?.color || "Color"}
                </p>
                <div className="flex items-center gap-3">
                  <label
                    className="group relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-border shadow-sm transition-all hover:scale-110 hover:shadow-md"
                    style={{ backgroundColor: displayColor }}
                  >
                    <Palette
                      className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100"
                      style={{ color: getContrastColor(displayColor) }}
                    />
                    <input
                      type="color"
                      value={displayColor}
                      onChange={(e) => startColorCountdown(e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      aria-label="Pick a primary color"
                    />
                  </label>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {dictionary?.customizer?.color || "Primary Color"}
                    </span>
                    {isEditingHex ? (
                      <input
                        autoFocus
                        type="text"
                        value={hexInput}
                        onChange={(e) => setHexInput(e.target.value)}
                        onBlur={() => {
                          const val = hexInput.trim()
                          const hex = val.startsWith("#") ? val : `#${val}`
                          if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
                            updateSettings({ ...settings, primaryColor: hex.toLowerCase() })
                          }
                          setIsEditingHex(false)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur()
                          } else if (e.key === "Escape") {
                            setIsEditingHex(false)
                          }
                        }}
                        className="w-20 rounded border border-input bg-transparent px-1.5 py-0.5 text-xs font-mono uppercase text-foreground outline-none focus:ring-1 focus:ring-ring"
                        placeholder="#000000"
                        maxLength={7}
                      />
                    ) : (
                      <span
                        className="text-xs font-mono text-muted-foreground uppercase cursor-pointer hover:text-foreground transition-colors border-b border-dashed border-transparent hover:border-muted-foreground"
                        onClick={() => {
                          setHexInput(displayColor)
                          setIsEditingHex(true)
                        }}
                        title="Click to edit hex code"
                      >
                        {displayColor}
                      </span>
                    )}
                  </div>

                  {/* Countdown badge */}
                  {countdown > 0 && (
                    <div className="ms-auto flex items-center gap-1.5">
                      <button
                        onClick={applyNow}
                        className="flex h-7 items-center gap-1 rounded-full bg-primary px-2.5 text-[11px] font-semibold text-primary-foreground shadow-sm transition-all hover:scale-105 hover:shadow-md"
                        title="Apply now"
                      >
                        <Check className="h-3 w-3" />
                        <span className="font-mono tabular-nums">
                          {countdown}s
                        </span>
                      </button>
                      <button
                        onClick={cancelPreview}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground shadow-sm transition-all hover:bg-destructive hover:text-destructive-foreground hover:scale-105"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick color presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "#2563eb", // blue
                    "#7c3aed", // violet
                    "#16a34a", // green
                    "#dc2626", // red
                    "#e11d48", // rose
                    "#f97316", // orange
                    "#facc15", // yellow
                    "#06b6d4", // cyan
                    "#ec4899", // pink
                    "#18181b", // zinc
                  ].map((color) => (
                    <button
                      key={color}
                      className="group relative h-7 w-7 rounded-full border border-border shadow-sm transition-all hover:scale-125 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        // Cancel any pending countdown
                        if (applyTimerRef.current) clearTimeout(applyTimerRef.current)
                        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)
                        setPreviewColor(null)
                        setCountdown(0)
                        // Apply immediately
                        updateSettings({ ...settings, primaryColor: color })
                      }}
                      aria-label={`Set color to ${color}`}
                    >
                      {displayColor.toLowerCase() ===
                        color.toLowerCase() && (
                        <span
                          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                          style={{ color: getContrastColor(color) }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <p className="text-sm">
                    {dictionary?.customizer?.radius || "Radius"}
                  </p>
                  {settings.radius !== 0.75 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs font-mono tabular-nums transition-colors hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        updateSettings({ ...settings, radius: 0.75 })
                      }
                    >
                      {dictionary?.customizer?.reset || "Reset"} (0.75)
                    </Button>
                  )}
                </div>
                <NumericScrubber
                  min={0}
                  max={1}
                  step={0.01}
                  value={settings.radius}
                  onChange={(val) =>
                    updateSettings({ ...settings, radius: val })
                  }
                  className="w-full"
                />
              </div>

              {/* Mode */}
              <div className="space-y-1.5">
                <p className="text-sm">
                  {dictionary?.customizer?.mode || "Mode"}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={
                      settings.mode === "light" ? "secondary" : "outline"
                    }
                    onClick={() => handleSetMode("light")}
                  >
                    <Sun className="shrink-0 h-4 w-4 me-2" />
                    {dictionary?.navigation?.mode?.light || "Light"}
                  </Button>
                  <Button
                    variant={settings.mode === "dark" ? "secondary" : "outline"}
                    onClick={() => handleSetMode("dark")}
                  >
                    <MoonStar className="shrink-0 h-4 w-4 me-2" />
                    {dictionary?.navigation?.mode?.dark || "Dark"}
                  </Button>
                  <Button
                    variant={
                      settings.mode === "system" ? "secondary" : "outline"
                    }
                    onClick={() => handleSetMode("system")}
                  >
                    <SunMoon className="shrink-0 h-4 w-4 me-2" />
                    {dictionary?.navigation?.mode?.system || "System"}
                  </Button>
                </div>

                {/* Layout */}
                <div className="space-y-1.5">
                  <span className="text-sm">
                    {dictionary?.customizer?.layout || "Layout"}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={
                        settings.layout === "horizontal"
                          ? "secondary"
                          : "outline"
                      }
                      onClick={() =>
                        updateSettings({
                          ...settings,
                          layout: "horizontal",
                        })
                      }
                    >
                      <AlignStartHorizontal className="shrink-0 h-4 w-4 me-2" />
                      {dictionary?.customizer?.horizontal || "Horizontal"}
                    </Button>
                    <Button
                      variant={
                        settings.layout === "vertical" ? "secondary" : "outline"
                      }
                      onClick={() =>
                        updateSettings({
                          ...settings,
                          layout: "vertical",
                        })
                      }
                    >
                      <AlignStartVertical className="shrink-0 h-4 w-4 me-2" />
                      {dictionary?.customizer?.vertical || "Vertical"}
                    </Button>
                  </div>
                </div>

                {/* Direction */}
                <div className="space-y-1.5">
                  <span className="text-sm">
                    {dictionary?.customizer?.direction || "Direction"}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={direction === "ltr" ? "secondary" : "outline"}
                      onClick={() => handleSetLocale("en")}
                    >
                      <AlignLeft className="shrink-0 h-4 w-4 me-2" />
                      {dictionary?.customizer?.ltr || "LRT"}
                    </Button>
                    <Button
                      variant={direction === "rtl" ? "secondary" : "outline"}
                      onClick={() => handleSetLocale("ar")}
                    >
                      <AlignRight className="shrink-0 h-4 w-4 me-2" />
                      {dictionary?.customizer?.rtl || "RTL"}
                    </Button>
                  </div>
                </div>

                {/* Sidebar Mode */}
                <div className="space-y-1.5">
                  <span className="text-sm">
                    {dictionary?.customizer?.sidebarMode || "Sidebar Mode"}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={
                        settings.sidebarMode === "open"
                          ? "secondary"
                          : "outline"
                      }
                      onClick={() => {
                        updateSettings({
                          ...settings,
                          sidebarMode: "open",
                        })
                        setOpen(true)
                      }}
                    >
                      <AlignStartVertical className="shrink-0 h-4 w-4 me-2" />
                      {dictionary?.customizer?.open || "Open"}
                    </Button>
                    <Button
                      variant={
                        settings.sidebarMode === "icons"
                          ? "secondary"
                          : "outline"
                      }
                      onClick={() => {
                        updateSettings({
                          ...settings,
                          sidebarMode: "icons",
                        })
                        setOpen(false)
                      }}
                    >
                      <PanelLeftClose className="shrink-0 h-4 w-4 me-2" />
                      {dictionary?.customizer?.icons || "Icons"}
                    </Button>
                    <Button
                      variant={
                        settings.sidebarMode === "closed"
                          ? "secondary"
                          : "outline"
                      }
                      onClick={() => {
                        updateSettings({
                          ...settings,
                          sidebarMode: "closed",
                        })
                        setOpen(false)
                      }}
                    >
                      <PanelLeftOpen className="shrink-0 h-4 w-4 me-2" />
                      {dictionary?.customizer?.closed || "Closed"}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleReset}
              >
                <RotateCcw className="shrink-0 h-4 w-4 me-2" />
                {dictionary?.customizer?.reset || "Reset"}
              </Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  )
}

/** Helper: returns white or black depending on which has better contrast */
function getContrastColor(hex: string): string {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return "#ffffff"
  let r = 0,
    g = 0,
    b = 0
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1])
    g = parseInt("0x" + hex[2] + hex[2])
    b = parseInt("0x" + hex[3] + hex[3])
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2])
    g = parseInt("0x" + hex[3] + hex[4])
    b = parseInt("0x" + hex[5] + hex[6])
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? "#18181b" : "#ffffff"
}
