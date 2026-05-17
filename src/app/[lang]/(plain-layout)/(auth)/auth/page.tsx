import type { LocaleType } from "@/types"
import type { Metadata } from "next"

import { getDictionary } from "@/lib/get-dictionary"

import { AuthPage } from "@/components/auth/auth-page"

export const metadata: Metadata = {
  title: "Auth",
}

export default async function AuthPageRoute(props: {
  params: Promise<{ lang: LocaleType }>
  searchParams: Promise<{ mode?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const dictionary = await getDictionary(params.lang)
  const initialMode = searchParams.mode === "register" ? "register" : "signin"

  return <AuthPage dictionary={dictionary} initialMode={initialMode} />
}
