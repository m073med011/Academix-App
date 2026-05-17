import type { LocaleType } from "@/types"
import type { Metadata } from "next"

import { getDictionary } from "@/lib/get-dictionary"

import { WizardContainer } from "./_components/wizard-container"

export const metadata: Metadata = {
  title: "Create Course",
}

export default async function CreateCoursePage(props: {
  params: Promise<{ lang: LocaleType }>
  searchParams: Promise<{ step?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const dictionary = await getDictionary(params.lang)
  const currentStep = parseInt(searchParams.step || "1", 10)

  return (
    <WizardContainer
      dictionary={dictionary}
      locale={params.lang}
      initialStep={currentStep}
    />
  )
}
