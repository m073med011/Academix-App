import { getServerSession } from "next-auth"

import type { LocaleType } from "@/types"
import type { Metadata } from "next"

import { authOptions } from "@/configs/next-auth"
import { getDictionary } from "@/lib/get-dictionary"

import { VerifyEmail } from "./verify-email"

// Define metadata for the page
// More info: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export const metadata: Metadata = {
  title: "Verify Email",
}

export default async function VerifyEmailPage(props: {
  params: Promise<{ lang: LocaleType }>
}) {
  const params = await props.params
  const dictionary = await getDictionary(params.lang)
  const session = await getServerSession(authOptions)

  return (
    <VerifyEmail
      dictionary={dictionary}
      email={session?.user?.email || undefined}
    />
  )
}
