"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { CardWithUnderlineTabs } from "@/app/[lang]/(dashboard-layout)/(design-system)/cards/basic/_components/card-with-underline-tabs"
import { Activity } from "./tabs/activity"
import { CreatedCourses } from "./tabs/created-courses"
import { PersonalInformation } from "./tabs/personal-information"
import { PurchasedCourses } from "./tabs/purchased-courses"

interface ProfileTabsProps {
  dictionary: DictionaryType
  locale: LocaleType
}

export function ProfileTabs({ dictionary, locale }: ProfileTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const activeTab = searchParams.get("tab") || "purchased"
  const t = dictionary.profilePage.tabs

  const isStudent = session?.user?.role === "student"

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    params.set("tab", value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const tabs = [
    {
      value: "purchased",
      label: t.purchasedCourses,
      content: <PurchasedCourses dictionary={dictionary} locale={locale} />,
    },
    // Only show created courses for non-student users
    ...(!isStudent
      ? [
          {
            value: "created",
            label: t.createdCourses,
            content: <CreatedCourses dictionary={dictionary} />,
          },
        ]
      : []),
    {
      value: "personal",
      label: t.personalInformation,
      content: <PersonalInformation dictionary={dictionary} />,
    },
    {
      value: "activity",
      label: t.activity,
      content: <Activity dictionary={dictionary} />,
    },
  ]

  return (
    <section className="py-2">
      <CardWithUnderlineTabs 
        tabs={tabs}
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      />
    </section>
  )
}
