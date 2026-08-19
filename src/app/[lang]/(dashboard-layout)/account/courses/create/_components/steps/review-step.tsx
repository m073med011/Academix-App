"use client"

import { useState } from "react"
import {
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  Eye,
  ExternalLink,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  Pencil,
  PlayCircle,
} from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { CourseContent, CourseFormData } from "../../types"
import { WIZARD_STEPS } from "../../types"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"

import { Section } from "../wizard-shell"

interface ReviewStepProps {
  dictionary: DictionaryType
  formData: CourseFormData
  onBack: () => void
  onPublish: () => void
  onEditStep: (step: number) => void
}

const CONTENT_TYPE_LABEL: Record<CourseContent["type"], string> = {
  video: "Video",
  text: "Article",
  quiz: "Quiz",
  assignment: "Assignment",
  link: "Link",
}

function ContentTypeGlyph({ type }: { type: CourseContent["type"] }) {
  const common = "size-3.5 text-muted-foreground"
  switch (type) {
    case "video":
      return <PlayCircle className={common} aria-hidden />
    case "quiz":
      return <HelpCircle className={common} aria-hidden />
    case "assignment":
      return <ClipboardList className={common} aria-hidden />
    case "link":
      return <LinkIcon className={common} aria-hidden />
    case "text":
    default:
      return <FileText className={common} aria-hidden />
  }
}

function EditLink({
  onClick,
  label = "Edit",
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
    >
      <Pencil className="size-3" />
      {label}
    </button>
  )
}

function DefinitionRow({
  term,
  children,
}: {
  term: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4 py-2 text-sm">
      <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
        {term}
      </dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  )
}

export function ReviewStep({
  dictionary,
  formData,
  onEditStep,
}: ReviewStepProps) {
  const t = dictionary.profilePage.createCourse.review
  const tActions = dictionary.profilePage.createCourse.actions

  const basicInfoComplete = Boolean(formData.title && formData.description)
  const curriculumComplete = formData.modules.length > 0
  const pricingComplete =
    formData.enrollmentType === "free" || formData.price > 0
  const mediaComplete = Boolean(formData.thumbnailUrl)

  const allChecksPass =
    basicInfoComplete && curriculumComplete && pricingComplete && mediaComplete

  const totalLessons = formData.modules.reduce(
    (acc, m) => acc + m.contents.length,
    0
  )

  return (
    <div className="flex flex-col gap-10">
      {/* Readiness strip — replaces the sidebar Card. Editorial, inline. */}
      <div className="flex flex-col gap-3 border-y py-4">
        <p
          className={cn(
            "text-sm",
            allChecksPass ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {allChecksPass
            ? t.allChecksPassed
            : "Almost there — a few sections still need attention."}
        </p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <ChecklistItem
            label={t.basicInfoComplete}
            done={basicInfoComplete}
            onJump={() => onEditStep(WIZARD_STEPS.BASIC_INFO)}
          />
          <ChecklistItem
            label={t.curriculumAdded}
            done={curriculumComplete}
            onJump={() => onEditStep(WIZARD_STEPS.CURRICULUM)}
          />
          <ChecklistItem
            label={t.pricingSet}
            done={pricingComplete}
            onJump={() => onEditStep(WIZARD_STEPS.PRICING)}
          />
          <ChecklistItem
            label={t.mediaUploaded}
            done={mediaComplete}
            onJump={() => onEditStep(WIZARD_STEPS.MEDIA)}
          />
        </ul>
      </div>

      <Section
        eyebrow={t.basicInformation}
        caption={
          <span className="flex items-center gap-3 text-xs text-muted-foreground">
            <EditLink
              onClick={() => onEditStep(WIZARD_STEPS.BASIC_INFO)}
              label={tActions.edit}
            />
          </span>
        }
      >
        <dl>
          <DefinitionRow
            term={dictionary.profilePage.createCourse.basicInfo.courseTitle}
          >
            {formData.title || (
              <span className="text-muted-foreground">Not set</span>
            )}
          </DefinitionRow>
          <Separator className="opacity-60" />
          <DefinitionRow term={t.category}>
            {formData.category || (
              <span className="text-muted-foreground">Not set</span>
            )}
          </DefinitionRow>
          <Separator className="opacity-60" />
          <DefinitionRow
            term={dictionary.profilePage.createCourse.basicInfo.targetAudience}
          >
            <span className="capitalize">{formData.level}</span>
          </DefinitionRow>
          {formData.description ? (
            <>
              <Separator className="opacity-60" />
              <DefinitionRow term="Description">
                <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {formData.description}
                </p>
              </DefinitionRow>
            </>
          ) : null}
        </dl>
      </Section>

      <Separator />

      <Section
        eyebrow={t.curriculum}
        caption={
          <span className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {formData.modules.length} {t.sections} · {totalLessons}{" "}
              {t.lectures}
            </span>
            <span aria-hidden>·</span>
            <EditLink
              onClick={() => onEditStep(WIZARD_STEPS.CURRICULUM)}
              label={tActions.edit}
            />
          </span>
        }
      >
        {formData.modules.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            No modules added yet.
          </p>
        ) : (
          <div className="flex flex-col">
            {formData.modules.map((module, moduleIndex) => (
              <ModuleSummary
                key={module.id}
                module={module}
                moduleIndex={moduleIndex}
              />
            ))}
          </div>
        )}
      </Section>

      <Separator />

      <Section
        eyebrow={t.courseMedia}
        caption={
          <span className="flex items-center gap-3 text-xs text-muted-foreground">
            <EditLink
              onClick={() => onEditStep(WIZARD_STEPS.MEDIA)}
              label={tActions.edit}
            />
          </span>
        }
      >
        <div className="flex items-start gap-4">
          <div className="aspect-video w-40 shrink-0 overflow-hidden rounded-md border bg-muted">
            {formData.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.thumbnailUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground">
                No image
              </div>
            )}
          </div>
          <dl className="flex-1 text-sm">
            <DefinitionRow
              term={dictionary.profilePage.createCourse.media.courseThumbnail}
            >
              {formData.thumbnailUrl ? "Uploaded" : "Not uploaded"}
            </DefinitionRow>
            <Separator className="opacity-60" />
            <DefinitionRow
              term={dictionary.profilePage.createCourse.media.promotionalVideo}
            >
              {formData.promoVideoUrl ? "Uploaded" : "Not uploaded"}
            </DefinitionRow>
          </dl>
        </div>
      </Section>

      <Separator />

      <Section
        eyebrow={t.pricingAndPromotions}
        caption={
          <span className="flex items-center gap-3 text-xs text-muted-foreground">
            <EditLink
              onClick={() => onEditStep(WIZARD_STEPS.PRICING)}
              label={tActions.edit}
            />
          </span>
        }
      >
        <dl>
          <DefinitionRow term={t.priceTier}>
            {formData.enrollmentType === "free"
              ? dictionary.profilePage.createCourse.pricing.free
              : `${formData.currency} ${formData.price.toFixed(2)}`}
          </DefinitionRow>
          <Separator className="opacity-60" />
          <DefinitionRow term="Enrollment">
            {formData.enrollmentType === "one-time-purchase"
              ? dictionary.profilePage.createCourse.pricing.oneTimePurchase
              : formData.enrollmentType === "subscription"
                ? dictionary.profilePage.createCourse.pricing.subscription
                : dictionary.profilePage.createCourse.pricing.free}
          </DefinitionRow>
          {formData.isPrivate ? (
            <>
              <Separator className="opacity-60" />
              <DefinitionRow term="Visibility">Private</DefinitionRow>
            </>
          ) : null}
          {formData.hasEnrollmentCap ? (
            <>
              <Separator className="opacity-60" />
              <DefinitionRow term="Cap">
                {formData.maxStudents} students
              </DefinitionRow>
            </>
          ) : null}
        </dl>
      </Section>
    </div>
  )
}

function ChecklistItem({
  label,
  done,
  onJump,
  optional = false,
}: {
  label: string
  done: boolean
  onJump: () => void
  optional?: boolean
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onJump}
        className="group inline-flex items-center gap-2 outline-none focus-visible:underline focus-visible:underline-offset-4"
      >
        <span
          className={cn(
            "inline-flex size-4 items-center justify-center rounded-full border transition-colors",
            done
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground"
          )}
          aria-hidden
        >
          {done ? <Check className="size-2.5" strokeWidth={3} /> : null}
        </span>
        <span
          className={cn(
            "text-xs transition-colors",
            done
              ? "font-medium text-foreground"
              : "text-muted-foreground group-hover:text-foreground/80"
          )}
        >
          {label}
          {optional && !done ? (
            <span className="ms-1 text-[0.6875rem] text-muted-foreground">
              (optional)
            </span>
          ) : null}
        </span>
      </button>
    </li>
  )
}

function ModuleSummary({
  module,
  moduleIndex,
}: {
  module: CourseFormData["modules"][number]
  moduleIndex: number
}) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-b border-border last:border-b-0"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 py-3 text-start"
        >
          {isOpen ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" />
          )}
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {String(moduleIndex + 1).padStart(2, "0")}
          </span>
          <span className="flex-1 truncate text-sm font-semibold text-foreground">
            {module.title}
          </span>
          <span className="text-xs text-muted-foreground">
            {module.contents.length}{" "}
            {module.contents.length === 1 ? "item" : "items"}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ms-6 flex flex-col gap-0 border-s border-border ps-5 pb-4">
          {module.contents.length === 0 ? (
            <p className="py-2 text-xs italic text-muted-foreground">
              No materials in this module.
            </p>
          ) : (
            module.contents.map((content) => (
              <ContentSummary key={content.id} content={content} />
            ))
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function ContentSummary({ content }: { content: CourseContent }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5">
        <ContentTypeGlyph type={content.type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium text-foreground">
            {content.title}
          </span>
          <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground">
            {CONTENT_TYPE_LABEL[content.type]}
          </span>
          {content.status === "draft" ? (
            <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground">
              · Draft
            </span>
          ) : null}
        </div>
        {content.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {content.description}
          </p>
        ) : null}
        {(content.type === "video" || content.type === "link") && content.url ? (
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-foreground underline-offset-4 hover:underline"
          >
            <ExternalLink className="size-3" />
            <span className="max-w-[20rem] truncate">{content.url}</span>
          </a>
        ) : null}
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[0.6875rem] text-muted-foreground">
          {content.isFreePreview ? (
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" /> Free preview
            </span>
          ) : null}
          {content.allowDownloads ? (
            <span className="inline-flex items-center gap-1">
              <Download className="size-3" /> Downloads allowed
            </span>
          ) : null}
          {content.duration && content.duration > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {content.duration} min
            </span>
          ) : null}
          {content.points && content.points > 0 ? (
            <span>{content.points} pts</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
