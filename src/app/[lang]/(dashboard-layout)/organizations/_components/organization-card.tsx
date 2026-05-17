"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import {
  Organization,
  OrganizationMembership,
  OrganizationRole,
  User,
} from "@/types/api"
import { formatDate } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DefaultImage } from "@/components/ui/defult-Image"
import { Separator } from "@/components/ui/separator"

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

  const isAdmin = role.name === "Admin"

  return (
    <Card
      asChild
      className="group flex flex-col overflow-hidden transition-colors duration-150 hover:border-foreground/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Link href={`/organizations/${org._id}?tab=courses`} tabIndex={0}>
        {/* ── Header ── */}
        <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-5 pb-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            <DefaultImage
              src={org.orgcover}
              alt={org.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1 pt-0.5">
            <CardTitle className="truncate text-sm font-semibold leading-tight tracking-tight">
              {org.name}
            </CardTitle>
            <Badge
              variant={isAdmin ? "default" : "secondary"}
              className="rounded-sm text-[11px] font-medium"
            >
              {role.name}
            </Badge>
          </div>

          {/* Navigability signal — sits at top-end, stays visible on hover */}
          <ArrowRight
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 rtl:rotate-180"
            aria-hidden
          />
        </CardHeader>

        {/* ── Body ── */}
        <CardContent className="flex flex-1 flex-col gap-4 p-5 pt-0">
          {/* Description */}
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {org.description || dictionary.noDescription}
          </p>

          {/* Quick stats */}
          {((org.levels && org.levels.length > 0) ||
            (org.terms && org.terms.length > 0)) && (
            <div className="flex flex-wrap gap-3">
              {org.levels && org.levels.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {org.levels.length}
                  </span>{" "}
                  {dictionary.levels}
                </span>
              )}
              {org.terms && org.terms.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {org.terms.length}
                  </span>{" "}
                  {dictionary.terms}
                </span>
              )}
            </div>
          )}

          {/* ── Meta strip ── */}
          <div className="mt-auto space-y-3">
            <Separator />

            {/* Owner */}
            {owner && typeof owner === "object" && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {dictionary.owner}
                </span>
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={owner.imageProfileUrl} alt={owner.name} />
                    <AvatarFallback className="text-[10px]">
                      {owner.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate text-xs font-medium text-foreground">
                    {owner.name}
                  </span>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {dictionary.joined}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {membership.joinedAt
                    ? formatDate(membership.joinedAt)
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {dictionary.created}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {org.createdAt ? formatDate(org.createdAt) : "—"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
