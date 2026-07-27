"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { organizationService } from "../../../_services/organization.service"

interface EditRoleModalProps {
  organizationId: string
  role: any | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditRoleModal({
  organizationId,
  role,
  isOpen,
  onClose,
  onSuccess,
}: EditRoleModalProps) {
  const [name, setName] = useState("")
  const [permissions, setPermissions] = useState({
    canManageOrganization: false,
    canManageLevels: false,
    canManageTerms: false,
    canManageCourses: false,
    canManageStudents: false,
    canManageRoles: false,
    canRecordAttendance: false,
    canViewReports: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (role) {
      setName(role.name || "")
      setPermissions({
        canManageOrganization: !!role.permissions?.canManageOrganization,
        canManageLevels: !!role.permissions?.canManageLevels,
        canManageTerms: !!role.permissions?.canManageTerms,
        canManageCourses: !!role.permissions?.canManageCourses,
        canManageStudents: !!role.permissions?.canManageStudents,
        canManageRoles: !!role.permissions?.canManageRoles,
        canRecordAttendance: !!role.permissions?.canRecordAttendance,
        canViewReports: !!role.permissions?.canViewReports,
      })
    } else {
      setName("")
      setPermissions({
        canManageOrganization: false,
        canManageLevels: false,
        canManageTerms: false,
        canManageCourses: false,
        canManageStudents: false,
        canManageRoles: false,
        canRecordAttendance: false,
        canViewReports: false,
      })
    }
  }, [role])

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Role name is required.")
      return
    }

    setLoading(true)
    try {
      await organizationService.updateRole(organizationId, role._id || role.id, { name, permissions })
      toast.success("Role updated successfully.")
      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update role.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Update the role name and permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-role-name">Role Name</Label>
            <Input
              id="edit-role-name"
              placeholder="e.g. Moderator"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {Object.entries(permissions).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`edit-perm-${key}`} 
                    checked={value} 
                    onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, [key]: !!checked }))}
                    disabled={loading}
                  />
                  <Label htmlFor={`edit-perm-${key}`} className="font-normal text-sm cursor-pointer">
                    {key.replace(/^can/, '').replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
