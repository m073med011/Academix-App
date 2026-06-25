"use client"

import { X } from "lucide-react"

import type { CloudinaryUploadResult } from "@/app/[lang]/(dashboard-layout)/account/courses/_services/cloudinary-service"
import type { DictionaryType } from "@/lib/get-dictionary"
import type { CourseFormData } from "../../types"

import { Button } from "@/components/ui/button"
import { CloudinaryUploader } from "@/components/ui/cloudinary-uploader"
import { DefaultImage } from "@/components/ui/defult-Image"
import { Input } from "@/components/ui/input"
import { Separator, SeparatorWithText } from "@/components/ui/separator"

import { Field, Section } from "../wizard-shell"

interface MediaStepProps {
  dictionary: DictionaryType
  formData: CourseFormData
  onUpdate: (data: Partial<CourseFormData>) => void
  onNext: () => void
  onBack: () => void
}

export function MediaStep({ dictionary, formData, onUpdate }: MediaStepProps) {
  const t = dictionary.profilePage.createCourse.media

  return (
    <div className="flex flex-col gap-10">
      <Section
        eyebrow="Cover image"
        caption={t.thumbnailRecommendation}
      >
        {formData.thumbnailUrl ? (
          <figure className="group relative overflow-hidden rounded-md border bg-muted">
            <div className="aspect-video w-full">
              <DefaultImage
                src={formData.thumbnailUrl}
                alt="Course thumbnail"
                fill
                className="h-full w-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-3 end-3 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => onUpdate({ thumbnailUrl: undefined })}
            >
              <X className="size-3.5" />
              Remove
            </Button>
          </figure>
        ) : (
          <CloudinaryUploader
            dictionary={dictionary}
            defaultResourceType="image"
            showTypeSelector={false}
            onUploadComplete={(result: CloudinaryUploadResult) =>
              onUpdate({ thumbnailUrl: result.secureUrl })
            }
          />
        )}
      </Section>

      <Separator />

      <Section
        eyebrow="Promotional video"
        caption={t.videoRecommendation}
      >
        {formData.promoVideoUrl ? (
          <figure className="relative overflow-hidden rounded-md border bg-black">
            <div className="aspect-video w-full">
              <video
                src={formData.promoVideoUrl}
                poster={formData.thumbnailUrl}
                controls
                className="h-full w-full"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-3 end-3 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => onUpdate({ promoVideoUrl: undefined })}
            >
              <X className="size-3.5" />
              Remove
            </Button>
          </figure>
        ) : (
          <div className="flex flex-col gap-5">
            <CloudinaryUploader
              dictionary={dictionary}
              defaultResourceType="video"
              showTypeSelector={false}
              onUploadComplete={(result: CloudinaryUploadResult) =>
                onUpdate({ promoVideoUrl: result.secureUrl })
              }
            />
            <SeparatorWithText>{t.or}</SeparatorWithText>
            <Field
              label={t.pasteVideoUrl}
              htmlFor="video-url"
              hint="YouTube, Vimeo, or any public mp4 link."
            >
              <Input
                id="video-url"
                type="url"
                placeholder={t.videoUrlPlaceholder}
                value={formData.promoVideoUrl || ""}
                onChange={(e) => onUpdate({ promoVideoUrl: e.target.value })}
              />
            </Field>
          </div>
        )}
      </Section>

      <Separator />

      <Section
        eyebrow="Course accent"
        caption={t.brandingDescription}
      >
        <div className="max-w-xs">
          <Field label={t.primaryBrandColor} htmlFor="brand-color">
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center start-3">
                <span
                  aria-hidden
                  className="size-4 rounded-full border border-border"
                  style={{ backgroundColor: formData.brandColor }}
                />
              </div>
              <Input
                id="brand-color"
                type="text"
                value={formData.brandColor}
                onChange={(e) => onUpdate({ brandColor: e.target.value })}
                className="ps-10 pe-12 font-mono text-xs uppercase tracking-wider"
              />
              <div className="absolute inset-y-0 flex items-center end-3">
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => onUpdate({ brandColor: e.target.value })}
                  className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
                  aria-label="Pick course accent color"
                />
              </div>
            </div>
          </Field>
        </div>
      </Section>
    </div>
  )
}
