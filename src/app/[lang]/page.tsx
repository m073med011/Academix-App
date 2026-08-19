import type { LocaleType } from "@/types"

import { rolesData } from "@/data/rolesData"

import { getDictionary } from "@/lib/get-dictionary"
import { ensureLocalizedPathname } from "@/lib/i18n"

import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"
import IntroAnimation from "@/components/ui/scroll-morph-hero"
import { ShaderBackgroundWrapper } from "@/components/ui/shader-background-wrapper"
import { LandingFooter } from "@/components/layout/landing-footer"
import { LandingHeader } from "@/components/layout/landing-header"

export default async function LandingPage(props: {
  params: Promise<{ lang: string }>
}) {
  const params = (await props.params) as { lang: LocaleType }
  const dictionary = await getDictionary(params.lang)

  const localizedRolesData = rolesData.map((role) => ({
    ...role,
    title:
      dictionary.landingPage.radialTimeline.roles[
        role.id.toString() as keyof typeof dictionary.landingPage.radialTimeline.roles
      ].title,
    date: dictionary.landingPage.radialTimeline.roles[
      role.id.toString() as keyof typeof dictionary.landingPage.radialTimeline.roles
    ].date,
    content:
      dictionary.landingPage.radialTimeline.roles[
        role.id.toString() as keyof typeof dictionary.landingPage.radialTimeline.roles
      ].content,
    category:
      dictionary.landingPage.radialTimeline.roles[
        role.id.toString() as keyof typeof dictionary.landingPage.radialTimeline.roles
      ].category,
    features:
      dictionary.landingPage.radialTimeline.roles[
        role.id.toString() as keyof typeof dictionary.landingPage.radialTimeline.roles
      ].features,
  }))

  return (
    <div className="dark relative flex min-h-screen w-full min-w-0 flex-col overflow-x-clip bg-black text-foreground antialiased">
      <ShaderBackgroundWrapper />

      <div className="relative z-10 flex min-h-screen w-full min-w-0 flex-col">
        <LandingHeader dictionary={dictionary} />

        <main className="w-full min-w-0 flex-1">
          <section className="relative z-20 flex min-h-[min(48rem,100svh)] w-full items-center px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-36 lg:pb-28 lg:pt-40">
            <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
              <h1 className="max-w-4xl text-balance text-[clamp(2.5rem,8vw,4.5rem)] leading-[1.08] font-semibold tracking-tight text-foreground">
                {dictionary.landingPage.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed">
                {dictionary.landingPage.hero.description}
              </p>
              <div className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mt-10 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                <a
                  href={ensureLocalizedPathname(
                    "/auth?mode=register",
                    params.lang
                  )}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-8 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {dictionary.landingPage.hero.getStarted}
                </a>
                <a
                  href={ensureLocalizedPathname("/public/store", params.lang)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-transparent px-8 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {dictionary.landingPage.hero.browseCourses}
                </a>
              </div>
            </div>
          </section>

          <section id="features" className="relative z-20 w-full scroll-mt-24">
            <IntroAnimation
              dictionary={dictionary.landingPage.scrollHero}
              closeLabel={dictionary.ui.breadcrumb.close}
            />
          </section>

          <section id="ecosystem" className="relative z-30 w-full scroll-mt-24">
            <RadialOrbitalTimeline
              timelineData={localizedRolesData}
              dictionary={dictionary.landingPage.radialTimeline}
              direction={params.lang === "ar" ? "rtl" : "ltr"}
            />
          </section>
        </main>

        <LandingFooter dictionary={dictionary} />
      </div>
    </div>
  )
}
