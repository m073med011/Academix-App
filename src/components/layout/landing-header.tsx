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
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LanguageDropdown } from "@/components/language-dropdown"
import { ModeDropdown } from "@/components/mode-dropdown"
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
    { label: t.testimonials, href: "#testimonials" },
    { label: t.pricing, href: "#pricing" },
  ]

  return (
    <>
      <Customizer />
      <header className="fixed top-4 z-50 w-full max-w-5xl left-0 right-0 mx-auto border rounded-full bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="flex h-14 items-center px-6">
        {/* Left: Logo */}
        <div className="flex flex-1 items-center justify-start">
          <Link
            href={ensureLocalizedPathname("/", locale)}
            className="flex items-center font-black"
          >
            <Image
              src="/images/logos/logo02.png"
              alt="Academix"
              height={26}
              width={26}
              className="dark:invert mr-2"
            />
            <span className="font-bold inline-block">Academix</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageDropdown dictionary={dictionary} />
            <ModeDropdown dictionary={dictionary} />
            <Button variant="ghost" size="sm" asChild className="rounded-full">
              <Link href={ensureLocalizedPathname("/auth/signin", locale)}>
                {t.signIn}
              </Link>
            </Button>
            <Button size="sm" asChild className="rounded-full">
              <Link href={ensureLocalizedPathname("/auth/register", locale)}>
                {t.getStarted}
              </Link>
            </Button>
          </div>

          {/* Mobile Actions: Only one primary button visible + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              size="sm"
              asChild
              className="hidden xs:inline-flex rounded-full"
            >
              <Link href={ensureLocalizedPathname("/auth/register", locale)}>
                {t.getStarted}
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-2">
                    <Image
                      src="/images/logos/logo02.png"
                      alt="Academix"
                      height={24}
                      width={24}
                      className="dark:invert"
                    />
                    Academix
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-lg font-medium transition-colors hover:text-foreground/80"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <hr className="my-2" />
                  <Link
                    href={ensureLocalizedPathname("/auth/signin", locale)}
                    className="text-lg font-medium transition-colors hover:text-foreground/80"
                  >
                    {t.signIn}
                  </Link>
                  <Link
                    href={ensureLocalizedPathname("/auth/register", locale)}
                    className="text-lg font-medium transition-colors hover:text-foreground/80"
                  >
                    {t.getStarted}
                  </Link>
                  <div className="mt-4 flex items-center gap-2">
                    <LanguageDropdown dictionary={dictionary} />
                    <ModeDropdown dictionary={dictionary} />
                  </div>
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
