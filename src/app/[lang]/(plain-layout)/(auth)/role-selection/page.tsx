import type { LocaleType } from "@/types"
import type { Metadata } from "next"

import { getDictionary } from "@/lib/get-dictionary"

import { RoleSelectionForm } from "./role-selection-form"

export const metadata: Metadata = {
  title: "Role Selection",
}

export default async function RoleSelectionPage(props: {
  params: Promise<{ lang: LocaleType }>
}) {
  const params = await props.params
  const dictionary = await getDictionary(params.lang)

  return <RoleSelectionForm dictionary={dictionary} />
}
