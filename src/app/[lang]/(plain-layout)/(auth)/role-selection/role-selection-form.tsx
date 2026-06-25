"use client"

import { useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Briefcase,
  CalendarDays,
  Check,
  GraduationCap,
  School,
  User,
} from "lucide-react"

import type { getDictionary } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { ApiClientError } from "@/lib/api-client"
import { ensureLocalizedPathname } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DefaultImage } from "@/components/ui/defult-Image"

type RoleType =
  | "student"
  | "freelancer"
  | "organizer"
  | "instructor"
  | "guest"
  | null

interface RoleSelectionFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
}

export function RoleSelectionForm({ dictionary }: RoleSelectionFormProps) {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { update } = useSession()
  const [selectedRole, setSelectedRole] = useState<RoleType>(null)
  const [isLoading, setIsLoading] = useState(false)
  const locale = params.lang as LocaleType
  const redirectPathname = searchParams.get("redirectTo")

  const roles = [
    {
      id: "student",
      label: dictionary.navigation.roleSelection.roles.student.label,
      description:
        dictionary.navigation.roleSelection.roles.student.description,
      icon: GraduationCap,
      image: "/images/illustrations/characters/Student.jpg",
    },
    {
      id: "freelancer",
      label: dictionary.navigation.roleSelection.roles.freelancer.label,
      description:
        dictionary.navigation.roleSelection.roles.freelancer.description,
      icon: Briefcase,
      image: "/images/illustrations/characters/freelancer.jpg",
    },
    {
      id: "organizer",
      label: dictionary.navigation.roleSelection.roles.organizer.label,
      description:
        dictionary.navigation.roleSelection.roles.organizer.description,
      icon: CalendarDays,
      image: "/images/illustrations/characters/Orgnazation.jpg",
    },
    {
      id: "instructor",
      label: dictionary.navigation.roleSelection.roles.instructor.label,
      description:
        dictionary.navigation.roleSelection.roles.instructor.description,
      icon: School,
      image: "/images/illustrations/characters/Instructor.jpg",
    },
    {
      id: "guest",
      label: dictionary.navigation.roleSelection.roles.guest.label,
      description: dictionary.navigation.roleSelection.roles.guest.description,
      icon: User,
      image: "/images/illustrations/characters/Gust.jpg",
    },
  ] as const

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role)
  }

  const handleSubmit = async () => {
    if (!selectedRole) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || dictionary.navigation.roleSelection.errorDescription
        )
      }

      // Update session with new role
      await update({ role: selectedRole })

      toast.success(dictionary.navigation.roleSelection.successTitle, {
        description:
          dictionary.navigation.roleSelection.successDescription.replace(
            "{role}",
            selectedRole
          ),
      })

      // Build the destination path with the role query parameter
      const homePath =
        process.env.NEXT_PUBLIC_HOME_PATHNAME || "/dashboards/analytics"
      // Use the redirect path if provided, but strip any query params
      // (like stale redirectTo) and locale prefix to build cleanly
      let basePath = redirectPathname
        ? redirectPathname.split("?")[0]
        : homePath
      // Strip locale prefix if present (e.g. /en/dashboards → /dashboards)
      const localePrefix = `/${locale}`
      if (basePath.startsWith(localePrefix)) {
        basePath = basePath.slice(localePrefix.length) || "/"
      }
      const destination = basePath

      // Use hard navigation so middleware sees the fresh JWT with the updated role
      window.location.href = ensureLocalizedPathname(destination, locale)
    } catch (error) {
      console.error("Role selection error:", error)

      if (error instanceof ApiClientError) {
        toast.error(dictionary.navigation.roleSelection.errorTitle, {
          description: error.message,
        })
      } else {
        toast.error(dictionary.navigation.roleSelection.errorTitle, {
          description:
            error instanceof Error
              ? error.message
              : dictionary.navigation.roleSelection.errorDescription,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {dictionary.navigation.roleSelection.title}
          </CardTitle>
          <CardDescription>
            {dictionary.navigation.roleSelection.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.id
            return (
              <Card
                key={role.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50 hover:bg-accent",
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted"
                )}
                onClick={() => handleRoleSelect(role.id as RoleType)}
              >
                <CardHeader className="items-center p-6 pb-2">
                  <div className="mb-4 flex w-full items-center justify-center">
                    <DefaultImage
                      src={role.image}
                      alt={role.label}
                      width={400}
                      height={400}
                      className="h-48 w-full max-w-48 object-cover"
                    />
                  </div>
                  <CardTitle className="text-center">{role.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-6 pt-0">
                  <CardDescription>{role.description}</CardDescription>
                </CardContent>
                {isSelected && (
                  <CardFooter className="justify-end p-6 pt-0 pb-6">
                    <Check className="size-5 text-primary" />
                  </CardFooter>
                )}
              </Card>
            )
          })}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            className="w-full max-w-sm"
            size="lg"
            disabled={!selectedRole || isLoading}
            onClick={handleSubmit}
          >
            {isLoading
              ? dictionary.navigation.roleSelection.saving
              : dictionary.navigation.roleSelection.continue}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
