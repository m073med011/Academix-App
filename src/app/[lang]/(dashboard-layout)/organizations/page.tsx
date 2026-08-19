import type { LocaleType } from "@/types"

import { getDictionary } from "@/lib/get-dictionary"

import OrganizationsView from "./_components/organizations-view"

interface OrganizationsPageProps {
  params: Promise<{
    lang: LocaleType
  }>
}

export default async function OrganizationsPage({
  params,
}: OrganizationsPageProps) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return (
    <OrganizationsView
      dictionary={dictionary.organizationsPage}
      fullDictionary={dictionary}
    />
  )
}
