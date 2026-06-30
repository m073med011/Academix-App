"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { organizationService } from "../../../_services/organization.service"

interface CreateRoleModalProps {
  organizationId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateRoleModal({
  organizationId,
  isOpen,
  onClose,
  onSuccess,
}: CreateRoleModalProps) {
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

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Role name is required.")
      return
    }

    setLoading(true)
    try {
      await organizationService.createRole(organizationId, { name, permissions })
      toast.success("Role created successfully.")
      onSuccess()
      onClose()
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
    } catch (error) {
      console.error(error)
      toast.error("Failed to create role.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
          <DialogDescription>
            Add a new role to your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
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
                    id={`create-perm-${key}`} 
                    checked={value} 
                    onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, [key]: !!checked }))}
                    disabled={loading}
                  />
                  <Label htmlFor={`create-perm-${key}`} className="font-normal text-sm cursor-pointer">
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
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
