"use client"

import { useCallback } from "react"
import { MoonStar, Sun } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"

import { useIsDarkMode } from "@/hooks/use-mode"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"

const modeIcons = {
  light: Sun,
  dark: MoonStar,
}

export function ModeDropdown({ dictionary }: { dictionary: DictionaryType }) {
  const { settings, updateSettings } = useSettings()
  const isDarkMode = useIsDarkMode()
  const nextMode = isDarkMode ? "light" : "dark"
  const ModeIcon = modeIcons[nextMode]
  const label = dictionary.navigation.mode[nextMode]

  const toggleMode = useCallback(() => {
    updateSettings({ ...settings, mode: nextMode })
  }, [nextMode, settings, updateSettings])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={toggleMode}
    >
      <ModeIcon className="size-4" />
    </Button>
  )
}
