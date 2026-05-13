import type { LocaleType } from "@/types"

import { getDictionary } from "@/lib/get-dictionary"
import { ensureLocalizedPathname } from "@/lib/i18n"

import { ShaderBackgroundWrapper } from "@/components/ui/shader-background-wrapper"
import { LandingFooter } from "@/components/layout/landing-footer"
import { LandingHeader } from "@/components/layout/landing-header"

// New imports
import IntroAnimation from "@/components/ui/scroll-morph-hero"
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"
import { rolesData } from "@/data/rolesData"



export default async function LandingPage(props: {
  params: Promise<{ lang: string }>
}) {
  const params = (await props.params) as { lang: LocaleType }
  const dictionary = await getDictionary(params.lang)

  return (
    <div className="dark relative flex min-h-screen flex-col w-full text-foreground antialiased">
      {/* Fixed Shader Background */}
      <ShaderBackgroundWrapper />

      {/* Main Content */}
      <div className="relative z-10 w-full">
        <LandingHeader dictionary={dictionary} />

        <main className="flex-1 w-full">
          {/* Hero Section */}
          <section className="relative z-20 w-full px-6 py-24 sm:py-32 lg:py-40">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Build skills that actually matter
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
                A modern learning platform for students, professionals, and teams — structured, outcome-driven education that helps you grow real-world skills and prove them.
              </p>
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                <a
                  href={ensureLocalizedPathname("/auth/register", params.lang)}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Get started
                </a>
                <a
                  href={ensureLocalizedPathname("/courses", params.lang)}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-transparent px-8 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Browse courses
                </a>
              </div>
            </div>
          </section>

          {/* Scroll Morph Hero Section */}
          <section className="w-full relative z-20">
            <IntroAnimation />
          </section>

          {/* Radial Orbital Timeline Section */}
          <section className="w-full relative z-30">
            <RadialOrbitalTimeline timelineData={rolesData} />
          </section>

        </main>

        <LandingFooter dictionary={dictionary} />
      </div>
    </div>
  )
}
