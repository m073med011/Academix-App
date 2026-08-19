"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { organizationService } from "../../../_services/organization.service"
import type { Organization } from "@/types/api"

interface EditOrganizationModalProps {
  organization: Organization | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (updated: Organization) => void
}

export function EditOrganizationModal({
  organization,
  isOpen,
  onClose,
  onSuccess,
}: EditOrganizationModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [orgcover, setOrgcover] = useState("")
  const [allowMultipleLevels, setAllowMultipleLevels] = useState(false)
  const [requireTermAssignment, setRequireTermAssignment] = useState(false)
  const [allowStudentSelfEnroll, setAllowStudentSelfEnroll] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (organization) {
      setName(organization.name || "")
      setDescription(organization.description || "")
      setOrgcover(organization.orgcover || "")
      setAllowMultipleLevels(!!organization.settings?.allowMultipleLevels)
      setRequireTermAssignment(!!organization.settings?.requireTermAssignment)
      setAllowStudentSelfEnroll(!!organization.settings?.allowStudentSelfEnroll)
    }
  }, [organization, isOpen])

  const handleSave = async () => {
    if (!organization) return
    if (!name.trim()) {
      toast.error("Organization name is required.")
      return
    }
    setLoading(true)
    try {
      const res: any = await organizationService.updateOrganization(organization._id, {
        name,
        description: description || undefined,
        orgcover: orgcover || undefined,
        settings: {
          allowMultipleLevels,
          requireTermAssignment,
          allowStudentSelfEnroll,
        },
      })
      const updated = (res?.data || res) as Organization
      toast.success("Organization updated successfully.")
      onSuccess(updated)
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update organization.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>Update your organization details and settings.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-cover">Cover Image URL</Label>
            <Input
              id="org-cover"
              placeholder="https://..."
              value={orgcover}
              onChange={(e) => setOrgcover(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-3 pt-2">
            <Label>Settings</Label>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <span className="text-sm">Allow Multiple Levels</span>
              <Switch checked={allowMultipleLevels} onCheckedChange={setAllowMultipleLevels} disabled={loading} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <span className="text-sm">Require Term Assignment</span>
              <Switch checked={requireTermAssignment} onCheckedChange={setRequireTermAssignment} disabled={loading} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <span className="text-sm">Allow Student Self-Enroll</span>
              <Switch checked={allowStudentSelfEnroll} onCheckedChange={setAllowStudentSelfEnroll} disabled={loading} />
            </div>
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
