"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Menu } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { ensureLocalizedPathname } from "@/lib/i18n"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LanguageDropdown } from "@/components/language-dropdown"
import { Customizer } from "@/components/layout/customizer"

interface LandingHeaderProps {
  dictionary: DictionaryType
}

export function LandingHeader({ dictionary }: LandingHeaderProps) {
  const params = useParams()
  const locale = params.lang as LocaleType
  const t = dictionary.landingPage?.header

  // Fallback if dictionary keys are missing during hot reload
  if (!t) return null

  const navItems = [
    { label: t.features, href: "#features" },
    { label: t.ecosystem, href: "#ecosystem" },
    {
      label: t.pricing,
      href: ensureLocalizedPathname("/public/PricingPlan", locale),
    },
  ]

  return (
    <>
      <Customizer />
      <header className="fixed inset-x-3 top-3 z-50 mx-auto w-auto max-w-6xl rounded-full border bg-background/75 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sm:inset-x-4 sm:top-4">
        <div className="flex h-14 min-w-0 items-center px-3 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center justify-start">
            <Link
              href={ensureLocalizedPathname("/", locale)}
              className="flex min-w-0 items-center rounded-sm font-black focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Image
                src="/images/logos/logo02.png"
                alt=""
                height={26}
                width={26}
                className="me-2 shrink-0 dark:invert"
              />
              <span className="truncate text-sm font-bold sm:text-base">
                Academix
              </span>
            </Link>
          </div>

          <nav
            aria-label="Academix"
            className="hidden items-center gap-5 text-sm font-medium lg:flex xl:gap-6"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm text-foreground/65 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <div className="hidden items-center gap-1.5 lg:flex">
              <LanguageDropdown dictionary={dictionary} />
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="rounded-full"
              >
                <Link href={ensureLocalizedPathname("/auth", locale)}>
                  {t.signIn}
                </Link>
              </Button>
              <Button size="sm" asChild className="rounded-full">
                <Link
                  href={ensureLocalizedPathname("/auth?mode=register", locale)}
                >
                  {t.getStarted}
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <Button
                size="sm"
                asChild
                className="hidden rounded-full sm:inline-flex"
              >
                <Link
                  href={ensureLocalizedPathname("/auth?mode=register", locale)}
                >
                  {t.getStarted}
                </Link>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-full"
                  >
                    <Menu className="size-5" aria-hidden="true" />
                    <span className="sr-only">
                      {dictionary.ui.breadcrumb.toggleMenu}
                    </span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="end"
                  className="w-[min(88vw,22rem)] overflow-y-auto p-5"
                >
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-start">
                      <Image
                        src="/images/logos/logo02.png"
                        alt=""
                        height={24}
                        width={24}
                        className="shrink-0 dark:invert"
                      />
                      Academix
                    </SheetTitle>
                  </SheetHeader>
                  <nav
                    aria-label="Academix"
                    className="mt-8 flex flex-col gap-1"
                  >
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className="rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                    <hr className="my-3" />
                    <SheetClose asChild>
                      <Link
                        href={ensureLocalizedPathname("/auth", locale)}
                        className="rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        {t.signIn}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href={ensureLocalizedPathname(
                          "/auth?mode=register",
                          locale
                        )}
                        className="rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        {t.getStarted}
                      </Link>
                    </SheetClose>
                  </nav>
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-5">
                    <LanguageDropdown dictionary={dictionary} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
