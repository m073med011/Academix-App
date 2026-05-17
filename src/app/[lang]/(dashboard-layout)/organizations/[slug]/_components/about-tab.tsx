"use client"

import { Calendar, Mail, User as UserIcon } from "lucide-react"

import { Organization,   User } from "@/types/api"

import { formatDate } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface AboutTabProps {
  organization: Organization
  dictionary: {
    title: string
    description: string
    owner: string
    created: string
    contact: string
  }
}

export function AboutTab({ organization, dictionary }: AboutTabProps) {
  const owner = organization.owner as User

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">{dictionary.description}</h4>
            <p className="mt-1 text-muted-foreground">
              {organization.description || "No description provided."}
            </p>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {dictionary.created}
              </h4>
              <p className="text-muted-foreground">
                {formatDate(organization.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.owner}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={owner?.imageProfileUrl} alt={owner?.name} />
              <AvatarFallback>
                {owner?.name?.charAt(0).toUpperCase() || "O"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="font-semibold">{owner?.name || "Unknown"}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{owner?.email || "No email"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
