"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { courseService } from "../../../../account/courses/_services/course-service"
import type { Course, CourseLevel } from "@/types/api"

interface EditCourseModalProps {
  course: Course | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const LEVELS: CourseLevel[] = ["beginner", "intermediate", "advanced", "expert"]

export function EditCourseModal({ course, isOpen, onClose, onSuccess }: EditCourseModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [level, setLevel] = useState<CourseLevel>("beginner")
  const [price, setPrice] = useState("0")
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (course) {
      setTitle(course.title || "")
      setDescription(course.description || "")
      setCategory(course.category || "")
      setLevel((course.level as CourseLevel) || "beginner")
      setPrice(String(course.price ?? 0))
      setIsPublished(!!course.isPublished)
    }
  }, [course, isOpen])

  const handleSave = async () => {
    if (!course) return
    if (!title.trim()) {
      toast.error("Title is required.")
      return
    }
    setLoading(true)
    try {
      await courseService.updateCourse(course._id, {
        title,
        description: description || undefined,
        category: category || undefined,
        level,
        price: Number(price) || 0,
        isPublished,
      })
      toast.success("Course updated successfully.")
      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update course.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>Update the course details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="course-title">Title</Label>
            <Input id="course-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-category">Category</Label>
              <Input
                id="course-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-level">Level</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as CourseLevel)} disabled={loading}>
                <SelectTrigger id="course-level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl} className="capitalize">
                      {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-price">Price</Label>
            <Input
              id="course-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md">
            <span className="text-sm">Published</span>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} disabled={loading} />
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
