import type { LocaleType } from "@/types"
import type { Metadata } from "next"
import { getDictionary } from "@/lib/get-dictionary"

import { BasicSteps } from "./_components/basic-steps"
import { ClickableSteps } from "./_components/clickable-steps"
import { StepsResponsive } from "./_components/steps-responsive"
import { StepsWithIcons } from "./_components/steps-with-icons"
import { StepsWizardForm } from "./_components/steps-wizard-form"
import { VerticalSteps } from "./_components/vertical-steps"

export const metadata: Metadata = {
  title: "Steps",
}

export default async function StepsPage(props: {
  params: Promise<{ lang: LocaleType }>
}) { 
  const params = await props.params
  const dictionary = await getDictionary(params.lang)
  const t = dictionary.stepsDemo

  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <BasicSteps dictionary={t} />
      <VerticalSteps dictionary={t} />
      <StepsWithIcons dictionary={t} />
      <ClickableSteps dictionary={t} />
      <StepsWizardForm dictionary={t} />
      <StepsResponsive dictionary={t} />
    </section>
  )
}
