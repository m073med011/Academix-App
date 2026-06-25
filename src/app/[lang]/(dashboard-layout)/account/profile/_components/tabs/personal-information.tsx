"use client"

import { useSession } from "next-auth/react"
import {
  Briefcase,
  Calendar,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
} from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"

import { typography } from "@/lib/typography"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PersonalInformationProps {
  dictionary: DictionaryType
}

export function PersonalInformation({ dictionary }: PersonalInformationProps) {
  const t = dictionary.profilePage.personalInfo
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="mt-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const user = session?.user

  // Use available user properties with type-safe access
  const userInfo = [
    {
      icon: Mail,
      label: t.email,
      value: user?.email || "Not available",
    },
    {
      icon: Shield,
      label: "Role",
      value: user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : "User",
    },
    {
      icon: Phone,
      label: t.phone,
      value: "Not provided",
    },
    {
      icon: MapPin,
      label: t.location,
      value: "Not provided",
    },
    {
      icon: Calendar,
      label: t.joined,
      value: "Not available",
    },
    {
      icon: Briefcase,
      label: t.occupation,
      value: "Not provided",
    },
    {
      icon: GraduationCap,
      label: t.education,
      value: "Not provided",
    },
  ]

  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {userInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={typography.muted}>{info.label}</p>
                    <p className={`${typography.large} mt-1 wrap-break-word`}>
                      {info.value}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
