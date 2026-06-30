"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { organizationService, type Level } from "../../../_services/organization.service"

interface LevelModalProps {
  organizationId: string
  level?: Level | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function LevelModal({
  organizationId,
  level,
  isOpen,
  onClose,
  onSuccess,
}: LevelModalProps) {
  const isEdit = !!level
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [order, setOrder] = useState<string>("0")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (level) {
      setName(level.name || "")
      setDescription(level.description || "")
      setOrder(String(level.order ?? 0))
    } else {
      setName("")
      setDescription("")
      setOrder("0")
    }
  }, [level, isOpen])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Level name is required.")
      return
    }

    setLoading(true)
    try {
      if (isEdit && level) {
        await organizationService.updateLevel(level._id, {
          name,
          description: description || undefined,
          order: Number(order) || 0,
        })
        toast.success("Level updated successfully.")
      } else {
        await organizationService.createLevel({
          name,
          description: description || undefined,
          order: Number(order) || 0,
          organizationId,
        })
        toast.success("Level created successfully.")
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(isEdit ? "Failed to update level." : "Failed to create level.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Level" : "Create Level"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the level details." : "Add a new academic level to your organization."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="level-name">Name</Label>
            <Input
              id="level-name"
              placeholder="e.g. Grade 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level-description">Description</Label>
            <Textarea
              id="level-description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level-order">Order</Label>
            <Input
              id="level-order"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Level"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
