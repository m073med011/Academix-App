"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Loader2, Plus } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type {
  DynamicColumn,
  DynamicFilter,
} from "../../(design-system)/tables/_components/tables/dynamic-table/types"
import {
  Organization,
  OrganizationMembership,
  OrganizationRole,
  User,
} from "@/types/api"

import { useRole } from "@/hooks/use-role"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DynamicTable } from "../../(design-system)/tables/_components/tables/dynamic-table"
import { organizationService } from "../_services/organization.service"
import { CreateOrganizationModal } from "./createorganization-modal"
import { OrganizationsSkeleton } from "./organizations-skeleton"

interface OrganizationsViewProps {
  dictionary: DictionaryType["organizationsPage"]
  fullDictionary: DictionaryType
}

type OrganizationTableRow = {
  id: string
  name: string
  orgcover: string
  role: string
  isAdmin: boolean
  description: string
  levelsCount: number
  termsCount: number
  ownerName: string
  ownerImage: string
  joinedAt: string
  createdAt: string
  originalOrgId: string
  // "my" = organizations the user belongs to, "public" = discoverable orgs.
  // Currently always "my"; the Public source isn't wired yet.
  scope: "my" | "public"
}

export default function OrganizationsView({
  dictionary,
  fullDictionary,
}: OrganizationsViewProps) {
  const { isRole } = useRole()
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const fetchOrganizations = async (isBackground = false) => {
    try {
      if (isBackground) {
        setIsRefetching(true)
      } else {
        setLoading(true)
      }
      const response = await organizationService.getUserOrganizations()

      if (response.success) {
        const data = response.data
        setMemberships(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error)
    } finally {
      setLoading(false)
      setIsRefetching(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const handleCreateSuccess = () => {
    setTimeout(() => fetchOrganizations(true), 800)
  }

  const validMemberships = memberships.filter(
    (m) => m.organizationId !== null && typeof m.organizationId === "object"
  )

  const columns: DynamicColumn<OrganizationTableRow>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Organization", // Using string literal as dictionary doesn't have a direct 'organization' key in list
        component: "custom",
        render: (_, row) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={row.orgcover} />
              <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Link
              href={`/organizations/${row.originalOrgId}?tab=courses`}
              className="font-medium hover:underline"
            >
              {row.name}
            </Link>
          </div>
        ),
        sortable: true,
      },
      {
        key: "role",
        label: "Role",
        component: "badge",
        getBadgeVariant: (value) =>
          value === "Admin" ? "default" : "secondary",
        sortable: true,
      },
      {
        key: "ownerName",
        label: dictionary.list.owner || "Owner",
        component: "custom",
        render: (_, row) =>
          row.ownerName ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={row.ownerImage} />
                <AvatarFallback>{row.ownerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{row.ownerName}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        sortable: true,
      },
      {
        key: "levelsCount",
        label: dictionary.list.levels || "Levels",
        component: "number",
        sortable: true,
      },
      {
        key: "termsCount",
        label: dictionary.list.terms || "Terms",
        component: "number",
        sortable: true,
      },
      {
        key: "joinedAt",
        label: dictionary.list.joined || "Joined",
        component: "date",
        sortable: true,
      },
      {
        // Drives the My / Public dropdown filter; not shown as a column.
        key: "scope",
        label: "Scope",
        component: "text",
        hidden: true,
        enableHiding: false,
      },
    ],
    [dictionary]
  )

  // Toolbar filters: scope (My/Public) + role dropdown + number ranges.
  // TODO: wire a public-organizations fetch when the endpoint exists; for now
  // all rows are scope "my", so selecting "Public" yields an empty result.
  const filters: DynamicFilter<OrganizationTableRow>[] = useMemo(
    () => [
      {
        column: "scope",
        type: "select",
        label: dictionary.list.myOrganizations || "Organizations",
        options: [
          {
            label: dictionary.list.myOrganizations || "My Organizations",
            value: "my",
          },
          {
            label:
              dictionary.list.publicOrganizations || "Public Organizations",
            value: "public",
          },
        ],
      },
      { column: "role", type: "multi-select", label: "Role" },
      {
        column: "levelsCount",
        type: "number-range",
        label: dictionary.list.levels || "Levels",
        min: 0,
      },
      {
        column: "termsCount",
        type: "number-range",
        label: dictionary.list.terms || "Terms",
        min: 0,
      },
    ],
    [dictionary]
  )

  // Contextual row colors keyed by role value.
  const roleColors: Record<string, string> = {
    Admin: "bg-primary/5 hover:bg-primary/10",
    Member: "bg-muted/40 hover:bg-muted/60",
  }

  const tableData: OrganizationTableRow[] = useMemo(() => {
    return validMemberships.map((membership) => {
      const org = membership.organizationId as Organization
      const role = membership.roleId as OrganizationRole
      const owner = typeof org.owner === "object" ? (org.owner as User) : null

      return {
        id: membership._id,
        name: org.name || "",
        orgcover: org.orgcover || "",
        role: role.name || "",
        isAdmin: role.name === "Admin",
        description: org.description || "",
        levelsCount: org.levels?.length || 0,
        termsCount: org.terms?.length || 0,
        ownerName: owner?.name || "",
        ownerImage: owner?.imageProfileUrl || "",
        joinedAt: membership.joinedAt || "",
        createdAt: org.createdAt || "",
        originalOrgId: org._id,
        scope: "my" as const,
      }
    })
  }, [memberships])

  return (
    <div className="container py-8 lg:py-12 space-y-8">
      {loading ? (
        <OrganizationsSkeleton />
      ) : (
        <>
          {isRefetching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Refreshing...</span>
            </div>
          )}
          <DynamicTable<OrganizationTableRow>
            data={tableData}
            columns={columns}
            filters={filters}
            createButton={
              isRole("organizer")
                ? {
                    label: dictionary.list.createOrganization,
                    icon: Plus,
                    onClick: () => setIsCreateModalOpen(true),
                  }
                : undefined
            }
            showCheckbox
            colorize
            colorizeColumn="role"
            colors={roleColors}
            searchColumn="name"
            searchPlaceholder={dictionary.list.searchPlaceholder || "Search..."}
            defaultView="table"
            title={dictionary.list.title || "Organizations"}
            rowIdKey="id"
          />
        </>
      )}

      <CreateOrganizationModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
        fullDictionary={fullDictionary}
        createModal={dictionary.createModal}
      />
    </div>
  )
}
