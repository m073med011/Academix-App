"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { organizationService } from "../../../_services/organization.service"

interface MemberRow {
  userId: string
  name: string
  roleId?: string
}

interface EditMemberRoleModalProps {
  organizationId: string
  member: MemberRow | null
  roles: { _id?: string; id?: string; name: string }[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditMemberRoleModal({
  organizationId,
  member,
  roles,
  isOpen,
  onClose,
  onSuccess,
}: EditMemberRoleModalProps) {
  const [roleId, setRoleId] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setRoleId(member?.roleId || "")
  }, [member, isOpen])

  const handleSave = async () => {
    if (!member) return
    if (!roleId) {
      toast.error("Select a role.")
      return
    }
    setLoading(true)
    try {
      await organizationService.updateMemberRole(organizationId, member.userId, { roleId })
      toast.success("Member role updated.")
      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update member role.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Update the role for <strong>{member?.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-member-role">Role</Label>
            <Select value={roleId} onValueChange={setRoleId} disabled={loading}>
              <SelectTrigger id="edit-member-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role._id || role.id} value={(role._id || role.id) as string}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
