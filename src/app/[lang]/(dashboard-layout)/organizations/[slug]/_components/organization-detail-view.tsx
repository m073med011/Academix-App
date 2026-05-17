"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import type { TabItem } from "@/app/[lang]/(dashboard-layout)/(design-system)/cards/basic/_components/card-with-underline-tabs"
import { Organization } from "@/types/api"
import { useRole } from "@/hooks/use-role"

import { CardWithUnderlineTabs } from "@/app/[lang]/(dashboard-layout)/(design-system)/cards/basic/_components/card-with-underline-tabs"
import { CoursesTab } from "./courses-tab"
import { PlaceholderTab } from "./placeholder-tab"
import { AboutTab } from "./about-tab"

interface OrganizationDetailViewProps {
  dictionary: {
    title: string
    organization: {
      title: string
      description: string
    }
    tabs: {
      about: string
      courses: string
      levels: string
      terms: string
      students: string
      members: string
      settings: string
      rolesPermissions: string
    }
    courses: {
      addNewCourse: string
      searchPlaceholder: string
      statusFilter: string
      export: string
      columns: {
        courseName: string
        status: string
        enrollees: string
        createdDate: string
        actions: string
      }
      status: {
        active: string
        pending: string
        archived: string
        all: string
      }
      actions: {
        view: string
        edit: string
        archive: string
        delete: string
      }
      comingSoon: {
        about: string
        levels: string
        terms: string
        students: string
        members: string
        settings: string
        roles: string
      }
    }
  }
  organization: Organization
}

export default function OrganizationDetailView({
  dictionary,
  organization,
}: OrganizationDetailViewProps) {
  const dict = dictionary
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isRole } = useRole()

  const baseValidTabs = ["about", "courses", "levels", "terms", "students", "members"]
  const validTabs = isRole("organizer") 
    ? [...baseValidTabs, "settings", "roles"] 
    : baseValidTabs

  const tabFromUrl = searchParams.get("tab")
  const currentTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "about"

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleAddCourse = () => {
    toast.success("Add New Course clicked")
  }

  // Define tabs for CardWithUnderlineTabs
  const baseTabs: TabItem[] = [
    {
      value: "about",
      label: dict.tabs.about,
      content: (
        <AboutTab
          organization={organization}
          dictionary={{
            title: dict.tabs.about,
            description: dict.organization.description,
            owner: "Owner",
            created: "Created At",
            contact: "Contact Information",
          }}
        />
      ),
    },
    {
      value: "courses",
      label: dict.tabs.courses,
      content: (
        <CoursesTab
          dictionary={{
            ...dict.courses,
            title: dict.tabs.courses,
          }}
        />
      ),
    },
    {
      value: "levels",
      label: dict.tabs.levels,
      content: <PlaceholderTab message={dict.courses.comingSoon.levels} />,
    },
    {
      value: "terms",
      label: dict.tabs.terms,
      content: <PlaceholderTab message={dict.courses.comingSoon.terms} />,
    },
    {
      value: "students",
      label: dict.tabs.students,
      content: <PlaceholderTab message={dict.courses.comingSoon.students} />,
    },
    {
      value: "members",
      label: dict.tabs.members,
      content: <PlaceholderTab message={dict.courses.comingSoon.members} />,
    },
  ]

  const organizationTabs: TabItem[] = isRole("organizer")
    ? [
        ...baseTabs,
        {
          value: "settings",
          label: dict.tabs.settings,
          content: <PlaceholderTab message={dict.courses.comingSoon.settings} />,
        },
        {
          value: "roles",
          label: dict.tabs.rolesPermissions,
          content: <PlaceholderTab message={dict.courses.comingSoon.roles} />,
        },
      ]
    : baseTabs

  return (
    <div className="container space-y-6 p-4 md:p-6">
     

      <CardWithUnderlineTabs 
        tabs={organizationTabs} 
        value={currentTab}
        onValueChange={handleTabChange}
      />
    </div>
  )
}
