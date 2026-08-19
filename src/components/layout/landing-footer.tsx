"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { buttonVariants } from "@/components/ui/button"

interface LandingFooterProps {
  dictionary: DictionaryType
}

export function LandingFooter({ dictionary }: LandingFooterProps) {
  const params = useParams()
  const locale = params.lang as LocaleType
  const t = dictionary.landingPage?.footer

  // Fallback
  if (!t) return null

  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-20 border-t bg-muted/40 px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-center text-sm text-muted-foreground sm:text-start">
          &copy; {currentYear} Academix. {t.rights}
        </p>
        <nav
          aria-label={`${t.terms}, ${t.privacy}`}
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-end"
        >
          <Link
            href={ensureLocalizedPathname("/terms", locale)}
            className={cn(
              buttonVariants({ variant: "link" }),
              "h-auto px-2 py-2 text-muted-foreground"
            )}
          >
            {t.terms}
          </Link>
          <Link
            href={ensureLocalizedPathname("/privacy", locale)}
            className={cn(
              buttonVariants({ variant: "link" }),
              "h-auto px-2 py-2 text-muted-foreground"
            )}
          >
            {t.privacy}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
