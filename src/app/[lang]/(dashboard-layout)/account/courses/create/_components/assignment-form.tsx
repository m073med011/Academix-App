"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CloudinaryUploader } from "@/components/ui/cloudinary-uploader"
import { DatePicker } from "@/components/ui/date-picker" // Assuming this exists or similar

import { DictionaryType } from "@/lib/get-dictionary"

interface AssignmentFormProps {
  points: number
  onChangePoints: (points: number) => void
  fileUrl: string
  onChangeFileUrl: (url: string) => void
  dictionary: DictionaryType
}

export function AssignmentForm({
  points,
  onChangePoints,
  fileUrl,
  onChangeFileUrl,
  dictionary,
}: AssignmentFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            min={0}
            value={points || ""}
            onChange={(e) => onChangePoints(parseInt(e.target.value) || 0)}
            placeholder="e.g. 100"
          />
        </div>
      </div>

      <div className="space-y-2">
         <Label>Assignment File (Optional)</Label>
         <CloudinaryUploader
             dictionary={dictionary}
             defaultResourceType="raw"
             showTypeSelector={false}
             onUploadComplete={(res) => onChangeFileUrl(res.secureUrl)}
             initialValue={fileUrl}
             onRemove={() => onChangeFileUrl("")}
         />
         <p className="text-sm text-muted-foreground">
            Upload a reference file or template for students.
         </p>
      </div>
    </div>
  )
}
