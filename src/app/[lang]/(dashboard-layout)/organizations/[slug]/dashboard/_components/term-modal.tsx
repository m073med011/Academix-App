"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { organizationService, type Term } from "../../../_services/organization.service"

interface TermModalProps {
  levelId: string
  term?: Term | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// Format an ISO date to yyyy-MM-dd for <input type="date">
function toDateInput(value?: string): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

export function TermModal({
  levelId,
  term,
  isOpen,
  onClose,
  onSuccess,
}: TermModalProps) {
  const isEdit = !!term
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (term) {
      setName(term.name || "")
      setDescription(term.description || "")
      setStartDate(toDateInput(term.startDate))
      setEndDate(toDateInput(term.endDate))
    } else {
      setName("")
      setDescription("")
      setStartDate("")
      setEndDate("")
    }
  }, [term, isOpen])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Term name is required.")
      return
    }
    if (!startDate || !endDate) {
      toast.error("Start and end dates are required.")
      return
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("End date must be after start date.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        name,
        description: description || undefined,
        startDate,
        endDate,
      }
      if (isEdit && term) {
        await organizationService.updateTerm(levelId, term._id, payload)
        toast.success("Term updated successfully.")
      } else {
        await organizationService.createTerm(levelId, payload)
        toast.success("Term created successfully.")
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(isEdit ? "Failed to update term." : "Failed to create term.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Term" : "Create Term"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the term details." : "Add a new term to the selected level."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="term-name">Name</Label>
            <Input
              id="term-name"
              placeholder="e.g. Fall 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="term-description">Description</Label>
            <Textarea
              id="term-description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="term-start">Start Date</Label>
              <Input
                id="term-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="term-end">End Date</Label>
              <Input
                id="term-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Term"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
