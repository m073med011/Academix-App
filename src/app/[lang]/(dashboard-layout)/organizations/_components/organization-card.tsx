"use client"

import Link from "next/link"
import { format } from "date-fns"
import {
  Organization,
  OrganizationMembership,
  OrganizationRole,
  User,
} from "@/types/api"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DefaultImage } from "@/components/ui/defult-Image"
interface OrganizationCardProps {
  membership: OrganizationMembership
  dictionary: {
    levels: string
    terms: string
    joined: string
    created: string
    manage: string
    viewDashboard: string
    owner: string
    actions: {
      edit: string
      manageMembers: string
      leave: string
    }
    noDescription: string
  }
}

export function OrganizationCard({
  membership,
  dictionary,
}: OrganizationCardProps) {
  // Guard: organizationId and roleId must be populated objects (not null or string IDs)
  if (
    !membership.organizationId ||
    typeof membership.organizationId === "string" ||
    !membership.roleId ||
    typeof membership.roleId === "string"
  ) {
    return null
  }

  const org = membership.organizationId as Organization
  const role = membership.roleId as OrganizationRole
  const owner = typeof org.owner === "string" ? null : (org.owner as User)

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex items-start gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
            <DefaultImage
              src={org.orgcover}
              alt={org.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base">{org.name}</CardTitle>
            <Badge
              variant={role.name === "Admin" ? "default" : "secondary"}
              className="rounded-full"
            >
              {role.name}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {org.description || dictionary.noDescription}
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {/* Display counts only if arrays have items */}
          {org.levels && org.levels.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="font-medium text-foreground">
                {org.levels.length}
              </span>{" "}
              {dictionary.levels}
            </div>
          )}

          {org.terms && org.terms.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="font-medium text-foreground">
                {org.terms.length}
              </span>{" "}
              {dictionary.terms}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {/* Owner Information */}
          {owner && typeof owner === "object" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{dictionary.owner}:</span>
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={owner.imageProfileUrl} alt={owner.name} />
                  <AvatarFallback className="text-[10px]">
                    {owner.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground truncate max-w-[120px]">
                  {owner.name}
                </span>
              </div>
            </div>
          )}

          {/* Date Information */}
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>{dictionary.joined}:</span>
              <span className="font-medium text-foreground">
                {membership.joinedAt
                  ? format(new Date(membership.joinedAt), "PP")
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{dictionary.created}:</span>
              <span className="font-medium text-foreground">
                {org.createdAt ? format(new Date(org.createdAt), "PP") : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4">
        <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
          {/* Placeholder for members count if we had it, using icon for visual consistency */}
          <div className="flex items-center gap-1">
            {/* Placeholder for future member count */}
          </div>
          <Link href={`/organizations/${org._id}?tab=about`}>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto font-medium text-primary hover:text-primary/80"
            >
              {role.name === "Admin"
                ? dictionary.manage
                : dictionary.viewDashboard}
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
