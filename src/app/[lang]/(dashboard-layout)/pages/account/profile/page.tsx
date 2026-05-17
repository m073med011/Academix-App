import { redirect } from "next/navigation"
import { serverUserService } from "@/app/[lang]/(dashboard-layout)/pages/account/_services/user-service"

import type { LocaleType } from "@/types"
import type { Metadata } from "next"

import { getAuthenticatedContext } from "@/lib/auth"
import { getDictionary } from "@/lib/get-dictionary"

import { ProfileHeader } from "./_components/profile-header"
import { ProfileTabs } from "./_components/profile-tabs"

// Define metadata for the page
// More info: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export const metadata: Metadata = {
  title: "Profile",
}

export default async function ProfilePage(props: {
  params: Promise<{ lang: LocaleType }>
}) {
  const params = await props.params
  const dictionary = await getDictionary(params.lang)
  const context = await getAuthenticatedContext()

  if (!context) {
    redirect("/auth")
  }

  const { getProfile } = await serverUserService(context.accessToken)
  const profileResponse = await getProfile()

  if (!profileResponse.success || !profileResponse.data) {
    // Handle error or redirect
    return <div>Error loading profile</div>
  }

  return (
    <div className="container px-0">
      <ProfileHeader
        locale={params.lang}
        dictionary={dictionary}
        user={profileResponse.data}
      />
      <ProfileTabs dictionary={dictionary} locale={params.lang} />
    </div>
  )
}
