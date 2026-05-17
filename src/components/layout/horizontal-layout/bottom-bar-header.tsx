"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { ensureLocalizedPathname } from "@/lib/i18n"

import { CartIcon } from "@/app/[lang]/(dashboard-layout)/public/store/_components/cart-icon"
import { LanguageDropdown } from "@/components/language-dropdown"
import { FullscreenToggle } from "@/components/layout/full-screen-toggle"
import { NotificationDropdown } from "@/components/layout/notification-dropdown"
import { UserDropdown } from "@/components/layout/user-dropdown"
import { ModeDropdown } from "@/components/mode-dropdown"
import { AppBreadcrumb } from "../app-breadcrumb"
import { ToggleMobileSidebar } from "../toggle-mobile-sidebar"

export function BottomBarHeader({
  dictionary,
}: {
  dictionary: DictionaryType
}) {
  const params = useParams()
  const locale = params.lang as LocaleType

  return (
    <div className="container flex h-14 items-center gap-4">
      <div className="flex items-center gap-4 flex-1">
        <ToggleMobileSidebar />
        <div className="flex items-center gap-4">
          <Link
            href={ensureLocalizedPathname("/", locale)}
            className="hidden text-foreground font-black lg:flex items-center gap-2"
          >
            <Image
              src="/images/logos/logo02.png"
              alt="Academix"
              height={26}
              width={26}
              className="dark:invert"
            />
            <span>Academix</span>
          </Link>
          <AppBreadcrumb dictionary={dictionary} />
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <CartIcon dictionary={dictionary} />
        <NotificationDropdown dictionary={dictionary} />
        <ModeDropdown dictionary={dictionary} />
        <LanguageDropdown dictionary={dictionary} />
        <FullscreenToggle />
        <UserDropdown dictionary={dictionary} locale={locale} />
      </div>
    </div>
  )
}
