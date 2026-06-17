import type { DictionaryType } from "@/lib/get-dictionary"
import type {
  DynamicColumn,
  DynamicFilter,
} from "../../(design-system)/tables/_components/types"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export type OrganizationTableRow = {
  id: string
  name: string
  orgcover: string
  role: string
  isAdmin: boolean
  description: string
  levelsCount: number | null
  termsCount: number | null
  coursesCount: number | null
  studentsCount: number | null
  ownerName: string
  ownerImage: string
  joinedAt: string
  createdAt: string
  originalOrgId: string
  scope: "my" | "public"
  actions?: unknown
}

export const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-primary/5 hover:bg-primary/10",
  Member: "bg-muted/40 hover:bg-muted/60",
}

export function getOrganizationColumns(
  dictionary: DictionaryType["organizationsPage"]
): DynamicColumn<OrganizationTableRow>[] {
  const t = dictionary
  return [
    {
      key: "name",
      label: "Organization",
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
      getBadgeVariant: (value) => (value === "Admin" ? "default" : "secondary"),
      sortable: true,
    },
    {
      key: "ownerName",
      label: t.list.owner || "Owner",
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
      label: t.list.levels || "Levels",
      component: "number",
      render: (value) => value === null || value === undefined ? "-" : value,
      sortable: true,
    },
    {
      key: "termsCount",
      label: t.list.terms || "Terms",
      component: "number",
      render: (value) => value === null || value === undefined ? "-" : value,
      sortable: true,
    },
    {
      key: "coursesCount",
      label: t.list.courses || "Courses",
      component: "number",
      render: (value) => value === null || value === undefined ? "-" : value,
      sortable: true,
    },
    {
      key: "studentsCount",
      label: t.list.students || "Students",
      component: "number",
      render: (value) => value === null || value === undefined ? "-" : value,
      sortable: true,
    },
    {
      key: "joinedAt",
      label: t.list.joined || "Joined",
      component: "date",
      sortable: true,
    },
    {
      key: "scope",
      label: "Scope",
      component: "text",
      hidden: true,
      enableHiding: false,
    },
    {
      key: "actions",
      label: "Actions",
      component: "custom",
      render: (_, row) => (
        <Link href={`/organizations/${row.originalOrgId}/dashboard`}>
          <Button variant="outline" size="sm">
            Dashboard
          </Button>
        </Link>
      ),
      sortable: false,
    },
  ]
}

export function getOrganizationFilters(
  dictionary: DictionaryType["organizationsPage"]
): DynamicFilter<OrganizationTableRow>[] {
  const t = dictionary
  return [
    {
      column: "scope",
      type: "select",
      label: t.list.myOrganizations || "Organizations",
      options: [
        {
          label: t.list.myOrganizations || "My Organizations",
          value: "my",
        },
        {
          label: t.list.publicOrganizations || "Public Organizations",
          value: "public",
        },
      ],
    },
    { column: "role", type: "multi-select", label: "Role" },
    {
      column: "levelsCount",
      type: "number-range",
      label: t.list.levels || "Levels",
      min: 0,
    },
    {
      column: "termsCount",
      type: "number-range",
      label: t.list.terms || "Terms",
      min: 0,
    },
    {
      column: "coursesCount",
      type: "number-range",
      label: t.list.courses || "Courses",
      min: 0,
    },
    {
      column: "studentsCount",
      type: "number-range",
      label: t.list.students || "Students",
      min: 0,
    },
  ]
}
