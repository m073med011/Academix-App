"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { useIsRtl } from "@/hooks/use-is-rtl"
import { LanguageDropdown } from "@/components/language-dropdown"
import { ModeDropdown } from "@/components/mode-dropdown"
import { Customizer } from "@/components/layout/customizer"
import { SignInForm } from "./sign-in-form"
import { RegisterForm } from "./register-form"

interface AuthPageProps {
  dictionary: DictionaryType
  initialMode?: "signin" | "register"
}

export function AuthPage({ dictionary, initialMode = "signin" }: AuthPageProps) {
  const [mode, setMode] = useState<"signin" | "register">(initialMode)
  const params = useParams()
  const locale = params.lang as LocaleType
  const isRtl = useIsRtl()

  // Direction multiplier: 1 for LTR, -1 for RTL
  const d = isRtl ? -1 : 1

  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const signInRef = useRef<HTMLDivElement>(null)
  const registerRef = useRef<HTMLDivElement>(null)
  const signInHeaderRef = useRef<HTMLDivElement>(null)
  const signInBodyRef = useRef<HTMLDivElement>(null)
  const registerHeaderRef = useRef<HTMLDivElement>(null)
  const registerBodyRef = useRef<HTMLDivElement>(null)

  // Overlay starts on the "end" side: right for LTR, left for RTL
  const overlayStart = isRtl ? { left: 0 } : { left: "50%" }

  // When switching to register, overlay moves to the "start" side:
  // LTR: right → left  (xPercent: -100)   RTL: left → right (xPercent: +100)
  const registerXPercent = -100 * d

  const { contextSafe } = useGSAP(
    () => {
      // Default state: register hidden (enters FROM the overlay side, so starts opposite)
      gsap.set(registerRef.current, { opacity: 0, x: -80 * d })
      gsap.set(registerBodyRef.current, { opacity: 0, y: 20 })

      if (initialMode === "register") {
        gsap.set(overlayRef.current, { xPercent: registerXPercent })
        gsap.set(signInRef.current, { opacity: 0, x: 80 * d })
        gsap.set(registerRef.current, { opacity: 1, x: 0 })
        gsap.set(registerBodyRef.current, { opacity: 1, y: 0 })
      }
    },
    { scope: containerRef, dependencies: [isRtl] }
  )

  const switchToRegister = contextSafe(() => {
    if (mode === "register") return
    setMode("register")

    const tl = gsap.timeline()

    // 1) Overlay slides to cover sign-in side (with subtle scale breathe)
    tl.to(
      overlayRef.current,
      {
        xPercent: registerXPercent,
        duration: 1.2,
        ease: "expo.inOut",
      },
      0
    )

    // 2) Sign-in header exits (title + description lift away)
    tl.to(
      signInHeaderRef.current,
      {
        opacity: 0,
        y: -20,
        duration: 0.35,
        ease: "power3.in",
      },
      0
    )

    // 3) Sign-in form body slides out toward the overlay side
    tl.to(
      signInBodyRef.current,
      {
        opacity: 0,
        x: 60 * d,
        duration: 0.4,
        ease: "power3.in",
      },
      0.02
    )

    // 4) Sign-in container fades toward overlay
    tl.to(
      signInRef.current,
      {
        opacity: 0,
        x: 80 * d,
        duration: 0.4,
        ease: "power3.in",
      },
      0.05
    )

    // 5) Register header enters (drops in from above)
    tl.fromTo(
      registerHeaderRef.current,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" },
      0.6
    )

    // 6) Register form body slides in from the overlay side
    tl.fromTo(
      registerBodyRef.current,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      0.7
    )

    // 7) Register container enters from overlay side
    tl.fromTo(
      registerRef.current,
      { opacity: 0, x: -80 * d },
      { opacity: 1, x: 0, duration: 0.55, ease: "power2.out" },
      0.55
    )
  })

  const switchToSignIn = contextSafe(() => {
    if (mode === "signin") return
    setMode("signin")

    const tl = gsap.timeline()

    // 1) Overlay slides back to its start side
    tl.to(
      overlayRef.current,
      {
        xPercent: 0,
        duration: 1.2,
        ease: "expo.inOut",
      },
      0
    )

    // 2) Register header exits
    tl.to(
      registerHeaderRef.current,
      {
        opacity: 0,
        y: -20,
        duration: 0.35,
        ease: "power3.in",
      },
      0
    )

    // 3) Register form body slides out toward the overlay side
    tl.to(
      registerBodyRef.current,
      {
        opacity: 0,
        x: -60 * d,
        duration: 0.4,
        ease: "power3.in",
      },
      0.02
    )

    // 4) Register container fades toward overlay
    tl.to(
      registerRef.current,
      {
        opacity: 0,
        x: -80 * d,
        duration: 0.4,
        ease: "power3.in",
      },
      0.05
    )

    // 5) Sign-in header enters
    tl.fromTo(
      signInHeaderRef.current,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" },
      0.6
    )

    // 6) Sign-in form body enters
    tl.fromTo(
      signInBodyRef.current,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      0.7
    )

    // 7) Sign-in container enters from overlay side
    tl.fromTo(
      signInRef.current,
      { opacity: 0, x: 80 * d },
      { opacity: 1, x: 0, duration: 0.55, ease: "power2.out" },
      0.55
    )
  })

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-svh w-full overflow-hidden"
    >
      <Customizer />

      {/* ─── Sign In Side ─── */}
      <div
        className={cn(
          "relative flex w-full flex-col items-center justify-center px-6 pt-24 pb-16 md:w-1/2 md:px-10",
          isRtl ? "md:order-2" : "md:order-1",
          mode !== "signin" && "hidden md:flex"
        )}
      >
        <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
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

        <div
          ref={signInRef}
          className={cn(
            "w-full max-w-md",
            mode === "register" && "pointer-events-none"
          )}
        >
          <div ref={signInHeaderRef} className="mb-10 flex flex-col gap-2 text-start">
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-foreground">
              {dictionary.auth.signIn.title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-[42ch]">
              {dictionary.auth.signIn.description}
            </p>
          </div>
          <div ref={signInBodyRef}>
            <SignInForm
              dictionary={dictionary}
              onSwitchToRegister={switchToRegister}
            />
          </div>
        </div>
      </div>

      {/* ─── Register Side ─── */}
      <div
        className={cn(
          "relative flex w-full flex-col items-center justify-center px-6 pt-24 pb-16 md:w-1/2 md:px-10",
          isRtl ? "md:order-1" : "md:order-2",
          mode !== "register" && "hidden md:flex"
        )}
      >
        <div
          ref={registerRef}
          className={cn(
            "w-full max-w-md",
            mode === "signin" && "pointer-events-none"
          )}
        >
          <div ref={registerHeaderRef} className="mb-10 flex flex-col gap-2 text-start">
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-foreground">
              {dictionary.auth.register.title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-[42ch]">
              {dictionary.auth.register.description}
            </p>
          </div>
          <div ref={registerBodyRef}>
            <RegisterForm
              dictionary={dictionary}
              onSwitchToSignIn={switchToSignIn}
            />
          </div>
        </div>
      </div>

      {/* ─── Sliding Video Overlay (desktop only) ─── */}
      <div
        ref={overlayRef}
        className="absolute top-0 z-10 hidden h-full w-1/2 md:block"
        style={overlayStart}
      >
        <video
          src="/images/Screens/auth/login.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={isRtl ? { transform: "scaleX(-1)" } : undefined}
        />
      </div>
    </section>
  )
}
