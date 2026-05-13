"use client"

import { createContext, useCallback, useEffect, useState } from "react"
import { useCookie } from "react-use"

import type { LocaleType, SettingsType } from "@/types"
import type { ReactNode } from "react"

export const defaultSettings: SettingsType = {
  primaryColor: "#2563eb",
  mode: "system",
  radius: 0.5,
  layout: "vertical",
  locale: "en",
  sidebarMode: "open",
}

export const SettingsContext = createContext<
  | {
      settings: SettingsType
      updateSettings: (newSettings: SettingsType) => void
      resetSettings: () => void
    }
  | undefined
>(undefined)

export function SettingsProvider({
  locale,
  children,
}: {
  locale: LocaleType
  children: ReactNode
}) {
  const [storedSettings, setStoredSettings, deleteStoredSettings] =
    useCookie("settings")
  const [settings, setSettings] = useState<SettingsType | null>(null)

  useEffect(() => {
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings)
      // Migrate old cookie: strip obsolete fields, merge with defaults
      const { theme: _t, lightness: _l, ...rest } = parsed
      const migrated = { ...defaultSettings, locale, ...rest }
      // Ensure primaryColor is always a valid hex
      if (!migrated.primaryColor || typeof migrated.primaryColor !== "string" || !migrated.primaryColor.startsWith("#")) {
        migrated.primaryColor = defaultSettings.primaryColor
      }
      setSettings(migrated)
    } else {
      setSettings({ ...defaultSettings, locale })
    }
  }, [storedSettings, locale])

  const updateSettings = useCallback(
    (newSettings: SettingsType) => {
      setStoredSettings(JSON.stringify(newSettings))
      setSettings(newSettings)
    },
    [setStoredSettings]
  )

  const resetSettings = useCallback(() => {
    deleteStoredSettings()
    setSettings(defaultSettings)
  }, [deleteStoredSettings])

  // Render children only when settings are ready
  if (!settings) {
    return null
  }

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
