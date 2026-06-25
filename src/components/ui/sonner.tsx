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
  const position = "top-center"

  return (
    <Sonner
      theme={mode as ToasterProps["theme"]}
      className="toaster group"
      position={position}
      dir={direction}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/95 group-[.toaster]:backdrop-blur group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-sm group-[.toaster]:!rounded-md group-[.toaster]:px-5 group-[.toaster]:py-2.5 group-[.toaster]:font-medium group-[.toaster]:items-center group-[.toaster]:!w-auto group-[.toaster]:min-h-0 group-[.toaster]:gap-3",
          error: "group-[.toaster]:!bg-destructive group-[.toaster]:!text-destructive-foreground group-[.toaster]:!border-destructive",
          success: "group-[.toaster]:!bg-success group-[.toaster]:!text-success-foreground group-[.toaster]:!border-success",
          warning: "group-[.toaster]:!bg-orange-500 group-[.toaster]:!text-white group-[.toaster]:!border-orange-500",
          info: "group-[.toaster]:!bg-blue-500 group-[.toaster]:!text-white group-[.toaster]:!border-blue-500",
          content: "group-[.toast]:flex group-[.toast]:flex-row group-[.toast]:items-center group-[.toast]:gap-3",
          title: "group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:whitespace-nowrap",
          description: "group-[.toast]:text-xs group-[.toast]:text-muted-foreground group-[.toast]:whitespace-nowrap group-[.toast]:!text-inherit group-[.toast]:opacity-90",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:!rounded-md group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:h-auto group-[.toast]:text-xs group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:!rounded-md group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:h-auto group-[.toast]:text-xs group-[.toast]:font-medium",
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
  (message: string | TranslationData, data?: ExternalToast): string | number
  success: (message: string | TranslationData, data?: ExternalToast) => string | number
  error: (message: string | TranslationData, data?: ExternalToast) => string | number
  info: (message: string | TranslationData, data?: ExternalToast) => string | number
  warning: (message: string | TranslationData, data?: ExternalToast) => string | number
  message: (message: string | TranslationData, data?: ExternalToast) => string | number
}

export const toast: ToastWithTranslation = Object.assign(
  (message: string | TranslationData, data?: ExternalToast) =>
    sonnerToast(resolveMessage(message), data),
  {
    success: (message: string | TranslationData, data?: ExternalToast) =>
      sonnerToast.success(resolveMessage(message), data),
    error: (message: string | TranslationData, data?: ExternalToast) =>
      sonnerToast.error(resolveMessage(message), data),
    info: (message: string | TranslationData, data?: ExternalToast) =>
      sonnerToast.info(resolveMessage(message), data),
    warning: (message: string | TranslationData, data?: ExternalToast) =>
      sonnerToast.warning(resolveMessage(message), data),
    message: (message: string | TranslationData, data?: ExternalToast) =>
      sonnerToast.message(resolveMessage(message), data),
  }
)
