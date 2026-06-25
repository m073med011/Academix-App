import type { LocaleType } from "@/types"
import type { Metadata } from "next"

import { getDictionary } from "@/lib/get-dictionary"

import { ReactivateAccount } from "./reactivate-account"

// Define metadata for the page
export const metadata: Metadata = {
  title: "Reactivate Account",
}

export default async function ReactivateAccountPage(props: {
  params: Promise<{ lang: LocaleType }>
}) {
  const params = await props.params
  const dictionary = await getDictionary(params.lang)

  return <ReactivateAccount dictionary={dictionary} />
}
