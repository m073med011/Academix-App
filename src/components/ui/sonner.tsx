"use client"

import { useEffect, useState } from "react"
import { Toaster as Sonner, toast as sonnerToast } from "sonner"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { ComponentProps } from "react"
import type { ExternalToast } from "sonner"

import { useSettings } from "@/hooks/use-settings"

type ToasterProps = ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  const { settings } = useSettings()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)")
    setIsMobile(mql.matches)

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  const mode = settings.mode
  const isRtl = settings.locale === "ar"
  const direction = !isRtl ? "rtl" : "ltr"
  const position = isMobile ? "bottom-center" : "top-center"

  return (
    <Sonner
      theme={mode as ToasterProps["theme"]}
      className="toaster group"
      position={position}
      dir={direction}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

// Helper to get nested value from dictionary
const getNestedValue = (obj: any, path: string): string | undefined => {
  const keys = path.split(".")
  let value = obj

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key]
    } else {
      return undefined
    }
  }

  return typeof value === "string" ? value : undefined
}

// Translation function type
type TranslationData = {
  key: string
  dictionary: DictionaryType
}

// Resolve message - either use plain string or translate from dictionary
const resolveMessage = (message: string | TranslationData): string => {
  if (typeof message === "string") {
    return message
  }

  const translated = getNestedValue(message.dictionary, message.key)
  return translated || message.key
}

// Enhanced toast interface
interface ToastWithTranslation {
  success: (message: string | TranslationData, data?: ExternalToast) => void
  error: (message: string | TranslationData, data?: ExternalToast) => void
  info: (message: string | TranslationData, data?: ExternalToast) => void
  warning: (message: string | TranslationData, data?: ExternalToast) => void
  message: (message: string | TranslationData, data?: ExternalToast) => void
}

export const toast: ToastWithTranslation = {
  success: (message, data) =>
    sonnerToast.success(resolveMessage(message), data),
  error: (message, data) => sonnerToast.error(resolveMessage(message), data),
  info: (message, data) => sonnerToast.info(resolveMessage(message), data),
  warning: (message, data) =>
    sonnerToast.warning(resolveMessage(message), data),
  message: (message, data) =>
    sonnerToast.message(resolveMessage(message), data),
}
