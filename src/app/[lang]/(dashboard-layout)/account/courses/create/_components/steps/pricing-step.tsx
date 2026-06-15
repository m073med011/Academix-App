"use client"

import { Calendar, Users } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { CourseFormData } from "../../types"

import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import { Field, Section } from "../wizard-shell"

interface PricingStepProps {
  dictionary: DictionaryType
  formData: CourseFormData
  onUpdate: (data: Partial<CourseFormData>) => void
  onNext: () => void
  onBack: () => void
}

export function PricingStep({
  dictionary,
  formData,
  onUpdate,
}: PricingStepProps) {
  const t = dictionary.profilePage.createCourse.pricing

  const enrollmentTypes = [
    {
      value: "free" as const,
      label: t.free,
      caption: "Open to anyone, no payment.",
    },
    {
      value: "one-time-purchase" as const,
      label: t.oneTimePurchase,
      caption: "Single payment for lifetime access.",
    },
    {
      value: "subscription" as const,
      label: t.subscription,
      caption: "Recurring billing while enrolled.",
    },
  ]

  if (formData.courseType === "organization") {
    return (
      <div className="flex flex-col gap-10">
        <Section
          eyebrow="Organization Course"
          caption="Pricing and access are managed automatically."
        >
          <div className="rounded-md border bg-muted/50 p-6 text-center">
            <h3 className="text-sm font-medium text-foreground">
              Organizational Course Settings
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Because this course belongs to an organization, it will automatically be set as private to the organization and free for its members. You do not need to configure enrollment types or prices.
            </p>
          </div>
        </Section>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <Section
        eyebrow="Enrollment"
        caption="How students gain access. This decides whether a price applies."
      >
        <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <legend className="sr-only">{t.enrollmentType}</legend>
          {enrollmentTypes.map((type) => {
            const checked = formData.enrollmentType === type.value
            return (
              <label
                key={type.value}
                className={cn(
                  "flex h-full cursor-pointer items-start gap-3 rounded-md border bg-background p-4 transition-colors",
                  checked
                    ? "border-foreground"
                    : "border-border hover:border-foreground/40"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                    checked
                      ? "border-foreground"
                      : "border-muted-foreground/40"
                  )}
                >
                  {checked ? (
                    <span className="size-2 rounded-full bg-foreground" />
                  ) : null}
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {type.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {type.caption}
                  </span>
                </span>
                <input
                  type="radio"
                  name="enrollment-type"
                  value={type.value}
                  checked={checked}
                  onChange={(e) =>
                    onUpdate({
                      enrollmentType: e.target
                        .value as CourseFormData["enrollmentType"],
                    })
                  }
                  className="sr-only"
                />
              </label>
            )
          })}
        </fieldset>
      </Section>

      {formData.enrollmentType !== "free" ? (
        <>
          <Separator />
          <Section
            eyebrow="Price"
            caption={
              formData.enrollmentType === "one-time-purchase"
                ? "Single payment; access never expires."
                : "Recurring charge while the subscription is active."
            }
          >
            <div className="flex max-w-sm flex-col gap-2">
              <Field label={t.coursePrice} htmlFor="course-price">
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 inline-flex items-center text-sm text-muted-foreground start-3">
                    $
                  </span>
                  <Input
                    id="course-price"
                    type="number"
                    inputMode="decimal"
                    placeholder="99.99"
                    value={formData.price || ""}
                    onChange={(e) =>
                      onUpdate({ price: parseFloat(e.target.value) || 0 })
                    }
                    className="ps-7 pe-20"
                  />
                  <div className="absolute inset-y-0 end-0 flex items-center">
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => onUpdate({ currency: value })}
                    >
                      <SelectTrigger className="h-full w-20 rounded-s-none border-0 border-s bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Field>
            </div>
          </Section>
        </>
      ) : null}

      <Separator />

      <Section
        eyebrow="Access"
        caption="Optional restrictions on who can enroll and when."
      >
        <div className="flex items-start justify-between gap-6 py-1">
          <div className="flex flex-col">
            <label
              htmlFor="private-course"
              className="text-sm font-medium text-foreground"
            >
              {t.privateCourse}
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.privateCourseDescription}
            </p>
          </div>
          <Switch
            id="private-course"
            checked={formData.isPrivate}
            onCheckedChange={(checked) => onUpdate({ isPrivate: checked })}
          />
        </div>

        <Separator className="opacity-60" />

        <div className="flex items-start justify-between gap-6 py-1">
          <div className="flex flex-col">
            <label
              htmlFor="enrollment-cap"
              className="text-sm font-medium text-foreground"
            >
              {t.enrollmentCap}
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.enrollmentCapDescription}
            </p>
          </div>
          <Switch
            id="enrollment-cap"
            checked={formData.hasEnrollmentCap}
            onCheckedChange={(checked) =>
              onUpdate({ hasEnrollmentCap: checked })
            }
          />
        </div>

        {formData.hasEnrollmentCap ? (
          <div className="max-w-xs">
            <Field label={t.maxStudents} htmlFor="max-students">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 flex items-center start-3">
                  <Users className="size-4 text-muted-foreground" />
                </div>
                <Input
                  id="max-students"
                  type="number"
                  placeholder="100"
                  value={formData.maxStudents || ""}
                  onChange={(e) =>
                    onUpdate({ maxStudents: parseInt(e.target.value) || 100 })
                  }
                  className="ps-10"
                />
              </div>
            </Field>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field
            label={t.enrollmentStartDate}
            htmlFor="start-date"
            hint="Optional. Defaults to today."
          >
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 flex items-center start-3">
                <Calendar className="size-4 text-muted-foreground" />
              </div>
              <Input
                id="start-date"
                type="date"
                value={formData.enrollmentStartDate || ""}
                onChange={(e) =>
                  onUpdate({ enrollmentStartDate: e.target.value })
                }
                className="ps-10"
              />
            </div>
          </Field>
          <Field
            label={t.enrollmentEndDate}
            htmlFor="end-date"
            hint="Optional. Leave blank for open enrollment."
          >
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 flex items-center start-3">
                <Calendar className="size-4 text-muted-foreground" />
              </div>
              <Input
                id="end-date"
                type="date"
                value={formData.enrollmentEndDate || ""}
                onChange={(e) =>
                  onUpdate({ enrollmentEndDate: e.target.value })
                }
                className="ps-10"
              />
            </div>
          </Field>
        </div>
      </Section>
    </div>
  )
}
