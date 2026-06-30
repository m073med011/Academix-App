"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash } from "lucide-react"
import { toast } from "sonner"

import { DynamicTable } from "../../../../(design-system)/tables/_components"
import type { DynamicColumn } from "../../../../(design-system)/tables/_components/types"
import { organizationService, type Level } from "../../../_services/organization.service"
import { AddMemberModal } from "./add-member-modal"
import { EditMemberRoleModal } from "./edit-member-role-modal"

interface MemberRow {
  membershipId: string
  userId: string
  name: string
  email: string
  imageProfileUrl?: string
  roleId?: string
  roleName: string
  levelName: string
  status: string
}

function unwrap<T>(res: any): T[] {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res?.data)) return res.data
  return []
}

// Flatten a populated membership document into a flat table row
function toRow(m: any): MemberRow {
  const user = typeof m.userId === "object" && m.userId ? m.userId : {}
  const role = typeof m.roleId === "object" && m.roleId ? m.roleId : {}
  const level = typeof m.levelId === "object" && m.levelId ? m.levelId : null
  return {
    membershipId: m._id,
    userId: user._id || (typeof m.userId === "string" ? m.userId : ""),
    name: user.name || "Unknown",
    email: user.email || "—",
    imageProfileUrl: user.imageProfileUrl,
    roleId: role._id || (typeof m.roleId === "string" ? m.roleId : undefined),
    roleName: role.name || "—",
    levelName: level?.name || "—",
    status: m.status || "active",
  }
}

export function UsersTab({ organizationId }: { organizationId: string }) {
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<any[]>([])
  const [levels, setLevels] = useState<Level[]>([])

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null)

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await organizationService.getMembers(organizationId, { limit: 100 })
      setMembers(unwrap<any>(res).map(toRow))
    } catch (error) {
      console.error(error)
      toast.error("Failed to load members.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
    // Load roles + levels for the add/edit modals
    organizationService
      .getRoles(organizationId)
      .then((res) => setRoles(unwrap<any>(res)))
      .catch(console.error)
    organizationService
      .getLevels(organizationId)
      .then((res) => setLevels(unwrap<Level>(res)))
      .catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId])

  const handleRemove = async (member: MemberRow) => {
    if (!window.confirm(`Remove "${member.name}" from this organization?`)) return
    try {
      setLoading(true)
      await organizationService.removeMember(organizationId, member.userId)
      toast.success("Member removed successfully.")
      fetchMembers()
    } catch (error) {
      console.error(error)
      toast.error("Failed to remove member.")
      setLoading(false)
    }
  }

  const columns: DynamicColumn<MemberRow>[] = [
    {
      key: "name",
      label: "Name",
      render: (_val, row) => (
        <div className="flex items-center gap-2">
          {row.imageProfileUrl ? (
            <img src={row.imageProfileUrl} alt={row.name} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {row.name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <span>{row.name}</span>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    { key: "roleName", label: "Role", component: "badge" },
    { key: "levelName", label: "Level" },
    { key: "status", label: "Status", component: "badge" },
  ]

  const actions = [
    {
      label: "Change Role",
      icon: Pencil,
      onClick: (row: MemberRow) => {
        setSelectedMember(row)
        setIsEditOpen(true)
      },
    },
    {
      label: "Remove",
      icon: Trash,
      variant: "destructive" as const,
      onClick: handleRemove,
    },
  ]

  return (
    <>
      <DynamicTable
        data={members as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DynamicColumn<Record<string, unknown>>[]}
        title="Users List"
        searchable
        searchColumn="name"
        searchPlaceholder="Search members..."
        noResultsMessage="No members found."
        isLoading={loading}
        actions={actions as any}
        createButton={{
          label: "Add Member",
          icon: Plus,
          onClick: () => setIsAddOpen(true),
        }}
      />

      <AddMemberModal
        organizationId={organizationId}
        roles={roles}
        levels={levels}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchMembers}
      />

      <EditMemberRoleModal
        organizationId={organizationId}
        member={selectedMember}
        roles={roles}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedMember(null)
        }}
        onSuccess={fetchMembers}
      />
    </>
  )
}
