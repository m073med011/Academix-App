"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"
import type { ComponentProps } from "react"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { LanguageDropdown } from "../language-dropdown"
import { ModeDropdown } from "../mode-dropdown"
import { Customizer } from "../layout/customizer"

interface AuthProps extends ComponentProps<"div"> {
  imgSrc?: string
  imgClassName?: string
  dictionary: DictionaryType
}

export function Auth({
  className,
  children,
  imgSrc,
  imgClassName,
  dictionary,
  ...props
}: AuthProps) {
  const params = useParams()
  const locale = params.lang as LocaleType

  return (
    <section
      className={cn(
        "min-h-svh w-full flex items-stretch",
        className
      )}
      {...props}
    >
      <Customizer />
      <div className="relative flex flex-1 flex-col md:basis-3/5 lg:basis-7/12">
        <header className="flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
          <Link
            href={ensureLocalizedPathname("/", locale)}
            className="z-10 inline-flex items-center text-foreground"
            aria-label="Academix"
          >
            <Image
              src="/images/logos/Logo.svg"
              width={48}
              height={28}
              alt=""
              priority
              className="dark:invert"
            />
            
          </Link>
          <div className="flex items-center gap-1">
            <LanguageDropdown dictionary={dictionary} />
            <ModeDropdown dictionary={dictionary} />
          </div>
        </header>
        <div className="flex flex-1 items-start justify-center px-6 pb-16 pt-6 md:items-center md:px-10 md:py-12">
          <div className="w-full max-w-104">
            {children}
          </div>
        </div>
      </div>
      {imgSrc && <AuthImage imgSrc={imgSrc} className={cn("", imgClassName)} />}
    </section>
  )
}

interface AuthImageProps extends ComponentProps<"div"> {
  imgSrc: string
}

export function AuthImage({ className, imgSrc, ...props }: AuthImageProps) {
  return (
    <div
      className={cn(
        "relative hidden self-stretch bg-muted md:block md:basis-2/5 lg:basis-5/12 border-s",
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <Image
        src={imgSrc}
        alt=""
        fill
        sizes="(max-width: 1200px) 40vw, 42vw"
        priority
        className="object-cover"
      />
    </div>
  )
}

export function AuthHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-start", className)}
      {...props}
    />
  )
}

export function AuthTitle({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-foreground",
        className
      )}
      {...props}
    />
  )
}

export function AuthDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-sm leading-relaxed text-muted-foreground max-w-[42ch]",
        className
      )}
      {...props}
    />
  )
}

export function AuthForm({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-10", className)}
      {...props}
    />
  )
}

export function AuthFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mt-10 grid gap-5", className)} {...props} />
}
