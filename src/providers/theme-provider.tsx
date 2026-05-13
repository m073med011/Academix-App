"use client"

import { useEffect } from "react"

import type { ReactNode } from "react"

import { generateThemeFromColor } from "@/configs/themes"

import { useSettings } from "@/hooks/use-settings"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings()

  useEffect(() => {
    const bodyElement = document.body

    // Clean up old class names just in case
    Array.from(bodyElement.classList)
      .filter((className) => className.startsWith("theme-") || className === "dark")
      .forEach((className) => {
        bodyElement.classList.remove(className)
      })

    // Add dark class based on mode setting
    const isDark =
      settings.mode === "dark" ||
      (settings.mode === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)

    if (isDark) {
      bodyElement.classList.add("dark")
    }

    // Apply dynamic radius
    const radiusValue =
      settings.radius === 1.0 ? "1.6rem" : `${settings.radius ?? 0.5}rem`
    bodyElement.style.setProperty("--radius", radiusValue)

    // Generate theme from the user's primary color
    const generated = generateThemeFromColor(settings.primaryColor)
    const mode = isDark ? "dark" : "light"
    const colors = generated[mode]

    Object.entries(colors).forEach(([key, value]) => {
      // Skip radius as it's handled separately
      if (key === "radius") return

      // Convert camelCase to kebab-case
      const cssVar = `--${key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase()}`
      bodyElement.style.setProperty(cssVar, value)
    })
  }, [settings.primaryColor, settings.radius, settings.mode])

  return <>{children}</>
}
