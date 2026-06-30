"use client"

import { useEffect, useMemo, useState } from "react"
import { LayoutDashboard, Plus, Trash2 } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { ActionItem, DialogConfig } from "../../(design-system)/tables/_components/types"
import {
  Organization,
  OrganizationMembership,
  OrganizationRole,
  User,
} from "@/types/api"

import { useRole } from "@/hooks/use-role"
import { organizationService } from "../_services/organization.service"
import { toast } from "sonner"
import {
  getOrganizationColumns,
  getOrganizationFilters,
  ROLE_COLORS,
  type OrganizationTableRow,
} from "./organizations-table-config"

export function useOrganizations(
  dictionary: DictionaryType["organizationsPage"]
) {
  const t = dictionary
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
    setIsCreateModalOpen(false)
    setTimeout(() => fetchOrganizations(true), 800)
  }

  const handleDeleteSelected = async (selectedRows: OrganizationTableRow[]) => {
    try {
      const ids = selectedRows.map((row) => row.originalOrgId)
      const response = await organizationService.deleteOrganizations(ids)
      if (response.success) {
        toast.success("Organizations deleted successfully")
        fetchOrganizations(true)
      } else {
        toast.error("Failed to delete organizations")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete organizations")
    }
  }

  const columns = useMemo(
    () => getOrganizationColumns(t),
    [t]
  )

  const filters = useMemo(
    () => getOrganizationFilters(t),
    [t]
  )

  const tableData: OrganizationTableRow[] = useMemo(() => {
    const validMemberships = memberships.filter(
      (m) => m.organizationId !== null && typeof m.organizationId === "object"
    )

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
        levelsCount: org.levelsCount ?? null,
        termsCount: org.termsCount ?? null,
        coursesCount: org.coursesCount ?? null,
        studentsCount: org.studentsCount ?? null,
        ownerName: owner?.name || "",
        ownerImage: owner?.imageProfileUrl || "",
        joinedAt: membership.joinedAt || "",
        createdAt: org.createdAt || "",
        originalOrgId: org._id,
        scope: "my" as const,
      }
    })
  }, [memberships])

  // Create button config — onClick is omitted; DynamicTable auto-wires it to
  // open the built-in dialog when a `dialog` config is provided.
  const createButton = isRole("organizer")
    ? {
      label: t.list.createOrganization,
      icon: Plus,
    }
    : undefined

  // Responsive dialog config for the DynamicTable's built-in dialog.
  const dialogConfig: DialogConfig = {
    open: isCreateModalOpen,
    onOpenChange: setIsCreateModalOpen,
    title: t.createModal.title,
    description: t.createModal.description,
  }

  // Context-menu actions (right-click on row / card)
  const actions: ActionItem<OrganizationTableRow>[] = useMemo(
    () => [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        onClick: (row) => {
          window.location.href = `/organizations/${row.originalOrgId}/dashboard`
        },
      },
      {
        label: "Delete",
        icon: Trash2,
        variant: "destructive" as const,
        separator: true,
        onClick: (row) => {
          handleDeleteSelected([row])
        },
      },
    ],
    [handleDeleteSelected]
  )

  return {
    loading,
    isRefetching,
    handleCreateSuccess,
    columns,
    filters,
    tableData,
    roleColors: ROLE_COLORS,
    createButton,
    dialogConfig,
    handleDeleteSelected,
    actions,
  }
}

export type { OrganizationTableRow }

