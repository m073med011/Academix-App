"use client"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { CourseFormData } from "../../types"

import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { Field, Section } from "../wizard-shell"

interface BasicInfoStepProps {
  dictionary: DictionaryType
  formData: CourseFormData
  onUpdate: (data: Partial<CourseFormData>) => void
  onNext: () => void
}

export function BasicInfoStep({
  dictionary,
  formData,
  onUpdate,
}: BasicInfoStepProps) {
  const t = dictionary.profilePage.createCourse.basicInfo

  return (
    <div className="flex flex-col gap-10">
      <Section
        eyebrow="Identity"
        caption="The line a prospective student reads first."
      >
        <Field label={t.courseTitle} htmlFor="course-title">
          <Input
            id="course-title"
            placeholder={t.courseTitlePlaceholder}
            value={formData.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
        </Field>

        <Field
          label={t.courseDescription}
          htmlFor="course-description"
          hint="A short summary, learning objectives, and prerequisites. Plain prose."
        >
          <Textarea
            id="course-description"
            placeholder={t.courseDescriptionPlaceholder}
            value={formData.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="min-h-40 resize-y"
          />
        </Field>
      </Section>

      <Separator />

      <Section
        eyebrow="Classification"
        caption="Used for search, sort, and shelving across the catalog."
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label={t.courseCategories} htmlFor="course-category">
            <Input
              id="course-category"
              placeholder={t.categoriesPlaceholder}
              value={formData.category}
              onChange={(e) => onUpdate({ category: e.target.value })}
            />
          </Field>

          <Field label={t.targetAudience} htmlFor="target-audience">
            <Select
              value={formData.level}
              onValueChange={(value) =>
                onUpdate({ level: value as CourseFormData["level"] })
              }
            >
              <SelectTrigger id="target-audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">
                  {t.audienceLevels.beginner}
                </SelectItem>
                <SelectItem value="intermediate">
                  {t.audienceLevels.intermediate}
                </SelectItem>
                <SelectItem value="advanced">
                  {t.audienceLevels.advanced}
                </SelectItem>
                <SelectItem value="expert">
                  {t.audienceLevels.expert}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Total duration"
            htmlFor="course-duration"
            hint="Hours, rounded to the nearest half."
          >
            <Input
              id="course-duration"
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g. 10.5"
              value={formData.duration || ""}
              onChange={(e) =>
                onUpdate({ duration: parseFloat(e.target.value) || 0 })
              }
            />
          </Field>
        </div>
      </Section>
    </div>
  )
}
