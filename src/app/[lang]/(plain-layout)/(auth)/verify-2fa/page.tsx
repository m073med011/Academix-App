import type { LocaleType } from "@/types"
import type { Metadata } from "next"

import { getDictionary } from "@/lib/get-dictionary"

import { Verify2FA } from "./verify-2fa"

// Define metadata for the page
export const metadata: Metadata = {
  title: "Two-Factor Authentication",
}

export default async function Verify2FAPage(props: {
  params: Promise<{ lang: LocaleType }>
}) {
  const params = await props.params
  const dictionary = await getDictionary(params.lang)

  return <Verify2FA dictionary={dictionary} />
}
