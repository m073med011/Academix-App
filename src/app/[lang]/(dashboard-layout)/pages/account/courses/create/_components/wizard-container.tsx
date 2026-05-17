"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { courseService } from "@/app/[lang]/(dashboard-layout)/pages/account/courses/_services/course-service"
import { toast } from "sonner"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"
import type { CreateCourseRequest } from "@/types/api"
import type { CourseFormData } from "../types"
import { initialCourseFormData, WIZARD_STEPS } from "../types"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import {
  Steps,
  StepsConnector,
  StepsItem,
  StepsList,
} from "@/components/ui/steps"

import { ActionBar } from "./action-bar"
import { BasicInfoStep } from "./steps/basic-info-step"
import { CurriculumStep } from "./steps/curriculum-step"
import { MediaStep } from "./steps/media-step"
import { PricingStep } from "./steps/pricing-step"
import { ReviewStep } from "./steps/review-step"
import { WizardShell } from "./wizard-shell"

interface WizardContainerProps {
  dictionary: DictionaryType
  locale: LocaleType
  initialStep: number
}

const TOTAL_STEPS = 5

// 1-indexed map of step number → which form fields make it complete
function getStepCompleteness(formData: CourseFormData) {
  const basic = Boolean(formData.title.trim() && formData.description.trim())
  const curriculum = formData.modules.length > 0
  const pricing =
    formData.enrollmentType === "free" || formData.price > 0
  const media = Boolean(formData.thumbnailUrl)
  return {
    1: basic,
    2: curriculum,
    3: pricing,
    4: media,
    5: basic && curriculum && pricing && media,
  } as const
}

function getBlockingHint(
  step: number,
  formData: CourseFormData
): string | undefined {
  switch (step) {
    case 1:
      if (!formData.title.trim() && !formData.description.trim())
        return "Add a title and description to continue."
      if (!formData.title.trim()) return "Add a course title to continue."
      if (!formData.description.trim())
        return "Add a course description to continue."
      return undefined
    case 2:
      if (formData.modules.length === 0)
        return "Add at least one module to continue."
      return undefined
    case 3:
      if (formData.enrollmentType !== "free" && !(formData.price > 0))
        return "Set a price or mark the course as free."
      return undefined
    case 4:
      if (!formData.thumbnailUrl)
        return "Upload a cover image to continue."
      return undefined
    default:
      return undefined
  }
}

function formatSavedAt(date: Date | null): string {
  if (!date) return ""
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function WizardContainer({
  dictionary,
  locale,
  initialStep,
}: WizardContainerProps) {
  const router = useRouter()
  const clampedInitialStep = Math.min(Math.max(initialStep, 1), TOTAL_STEPS)
  const [currentStep, setCurrentStep] = useState(clampedInitialStep)
  // Steps the user has actually been on. Used to gate the Steps primitive's
  // jump behavior: a step is clickable only if it's already been visited or
  // its requirements are met.
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(
    () => new Set(Array.from({ length: clampedInitialStep }, (_, i) => i + 1))
  )
  const [formData, setFormData] = useState<CourseFormData>(initialCourseFormData)
  const [isPublishing, setIsPublishing] = useState(false)
  const isPublishingRef = useRef(false)

  // Auto-save indicator (no-op hook). When form data changes, show
  // "Saving…" briefly, then "Saved HH:MM". Real persistence is a follow-up.
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [isSavingIndicator, setIsSavingIndicator] = useState(false)
  const firstRenderRef = useRef(true)
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    setIsSavingIndicator(true)
    const t = setTimeout(() => {
      setIsSavingIndicator(false)
      setSavedAt(new Date())
    }, 450)
    return () => clearTimeout(t)
  }, [formData])

  const t = dictionary.profilePage.createCourse
  const tSteps = t.steps
  const tActions = t.actions

  const completeness = useMemo(() => getStepCompleteness(formData), [formData])
  const canContinue = completeness[currentStep as keyof typeof completeness]
  const blockingHint = getBlockingHint(currentStep, formData)

  // Local view-model for the Steps rail. Kept tiny — the Steps primitive
  // owns rendering; we only feed labels, captions, and completeness.
  const railSteps = useMemo(
    () => [
      {
        number: WIZARD_STEPS.BASIC_INFO,
        label: tSteps.basicInfo,
        description: "Title, description, level",
        complete: completeness[1],
      },
      {
        number: WIZARD_STEPS.CURRICULUM,
        label: tSteps.curriculum,
        description: "Modules & materials",
        complete: completeness[2],
      },
      {
        number: WIZARD_STEPS.PRICING,
        label: tSteps.pricing,
        description: "Enrollment & price",
        complete: completeness[3],
      },
      {
        number: WIZARD_STEPS.MEDIA,
        label: tSteps.media,
        description: "Cover image required",
        complete: completeness[4],
      },
      {
        number: WIZARD_STEPS.REVIEW,
        label: tSteps.review,
        description: "Final check & publish",
        complete: completeness[5],
      },
    ],
    [tSteps, completeness]
  )

  const currentRailStep = railSteps.find((s) => s.number === currentStep)

  const updateFormData = (data: Partial<CourseFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const goToStep = (step: number) => {
    const newStep = Math.min(Math.max(step, 1), TOTAL_STEPS)
    setCurrentStep(newStep)
    setVisitedSteps((prev) => {
      if (prev.has(newStep)) return prev
      const next = new Set(prev)
      next.add(newStep)
      return next
    })
    router.push(
      ensureLocalizedPathname(
        `/pages/account/courses/create?step=${newStep}`,
        locale
      ),
      { scroll: false }
    )
  }

  // Steps primitive is 0-indexed; the wizard is 1-indexed. This is the only
  // place we cross that boundary.
  const handleStepsChange = (zeroIndexed: number) => {
    const target = zeroIndexed + 1
    if (target === currentStep) return
    const railTarget = railSteps.find((s) => s.number === target)
    const isVisited = visitedSteps.has(target)
    const isComplete = railTarget?.complete ?? false
    // Per spec: jumping is only allowed into a step the user has already
    // visited or whose requirements are already satisfied. Otherwise
    // navigation must go through Back / Continue so validation can gate it.
    if (!isVisited && !isComplete) return
    goToStep(target)
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) goToStep(currentStep - 1)
  }

  const handlePublish = async () => {
    if (isPublishingRef.current) return
    if (!completeness[5]) {
      toast.error("Please complete all required fields before publishing")
      return
    }
    isPublishingRef.current = true
    setIsPublishing(true)

    try {
      const createCourseData: CreateCourseRequest = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        price: formData.price,
        currency: formData.currency,
        duration: formData.duration,
        thumbnailUrl: formData.thumbnailUrl,
        promoVideoUrl: formData.promoVideoUrl,
        brandColor: formData.brandColor,
        enrollmentType: formData.enrollmentType,
        enrollmentStartDate: formData.enrollmentStartDate,
        enrollmentEndDate: formData.enrollmentEndDate,
        isPublished: true,
        isOrgPrivate: formData.isPrivate,
        modules: [],
      }

      const createdCourse = await courseService.createCourse(createCourseData)
      const courseId = createdCourse._id

      const modulesWithMaterials = await Promise.all(
        formData.modules
          .filter((m) => m.title && m.title.trim() !== "")
          .map(async (module) => {
            const materialPromises = module.contents
              .filter((c) => c.title && c.title.trim() !== "")
              .map(async (content, index) => {
                let type:
                  | "video"
                  | "text"
                  | "quiz"
                  | "assignment"
                  | "link"
                  | "pdf" = "text"
                switch (content.type) {
                  case "video":
                    type = "video"
                    break
                  case "text":
                    type = "text"
                    break
                  case "quiz":
                    type = "quiz"
                    break
                  case "assignment":
                    type = "assignment"
                    break
                  case "link":
                    type = "link"
                    break
                }
                const materialData = {
                  title: content.title,
                  description: content.description,
                  courseId: courseId,
                  type,
                  content: content.content,
                  url: content.url,
                  duration: content.duration,
                  order: index,
                  isPublished: true,
                  isFreePreview: content.isFreePreview,
                  allowDownloads: content.allowDownloads,
                  points: content.points,
                  dueDate: content.dueDate,
                  submissionTypes: content.submissionTypes,
                  allowLate: content.allowLate,
                  openInNewTab: content.openInNewTab,
                  thumbnailUrl: content.thumbnailUrl,
                  quizQuestions: content.quizQuestions,
                  assignmentFileUrl: content.assignmentFileUrl,
                }
                const createdMaterial =
                  await courseService.createMaterial(materialData)
                return {
                  materialId: createdMaterial._id,
                  order: index,
                }
              })
            const items = await Promise.all(materialPromises)
            return { title: module.title, items }
          })
      )

      if (modulesWithMaterials.length > 0) {
        await courseService.updateCourse(courseId, {
          modules: modulesWithMaterials,
        })
      }

      toast.success("Course published successfully!")
      router.push(ensureLocalizedPathname(`/public/course/${courseId}`, locale))
    } catch (error) {
      console.error("Failed to publish course:", error)
      toast.error("Failed to publish course. Please try again.")
    } finally {
      isPublishingRef.current = false
      setIsPublishing(false)
    }
  }

  const header = (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {t.createNewCourse}
      </span>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          {currentStepTitle(currentStep, t)}
        </h1>
        <p
          className="text-xs text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {isSavingIndicator
            ? "Saving…"
            : savedAt
              ? `Draft saved ${formatSavedAt(savedAt)}`
              : "Draft will save automatically"}
        </p>
      </div>
      <p className="max-w-2xl text-sm text-muted-foreground">
        {currentStepDescription(currentStep, t)}
      </p>
      <div className="mt-2 lg:hidden" aria-label="Create course progress">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {currentRailStep?.label}
            </span>
          </div>
          <ol className="flex items-center gap-1.5" role="list">
            {railSteps.map((step) => {
              const isComplete = step.number < currentStep || step.complete
              const isCurrent = step.number === currentStep
              return (
                <li
                  key={step.number}
                  aria-hidden
                  className={cn(
                    "h-1 rounded-full transition-all",
                    isCurrent
                      ? "w-6 bg-foreground"
                      : isComplete
                        ? "w-3 bg-foreground"
                        : "w-3 bg-border"
                  )}
                />
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )

  return (
    <WizardShell
      header={header}
      rail={
        <div className="hidden lg:block">
          <Steps
            totalSteps={TOTAL_STEPS}
            orientation="vertical"
            variant="outline"
            activeStep={currentStep - 1}
            onStepChange={handleStepsChange}
            allowJump
          >
            <StepsList>
              {railSteps.map((step, index) => (
                <Fragment key={step.number}>
                  <StepsItem
                    step={index}
                    label={step.label}
                    description={step.description}
                  />
                  {index < railSteps.length - 1 ? (
                    <StepsConnector afterStep={index} />
                  ) : null}
                </Fragment>
              ))}
            </StepsList>
          </Steps>
        </div>
      }
      actionBar={
        <ActionBar
          activeStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onBack={handleBack}
          onNext={handleNext}
          onPublish={handlePublish}
          canContinue={Boolean(canContinue)}
          blockingHint={blockingHint}
          isPublishing={isPublishing}
          nextLabel={tActions.next}
          backLabel={tActions.back}
          publishLabel={t.review.publishCourse}
        />
      }
    >
      {currentStep === WIZARD_STEPS.BASIC_INFO && (
        <BasicInfoStep
          dictionary={dictionary}
          formData={formData}
          onUpdate={updateFormData}
          onNext={handleNext}
        />
      )}
      {currentStep === WIZARD_STEPS.CURRICULUM && (
        <CurriculumStep
          dictionary={dictionary}
          formData={formData}
          onUpdate={updateFormData}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === WIZARD_STEPS.PRICING && (
        <PricingStep
          dictionary={dictionary}
          formData={formData}
          onUpdate={updateFormData}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === WIZARD_STEPS.MEDIA && (
        <MediaStep
          dictionary={dictionary}
          formData={formData}
          onUpdate={updateFormData}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === WIZARD_STEPS.REVIEW && (
        <ReviewStep
          dictionary={dictionary}
          formData={formData}
          onBack={handleBack}
          onPublish={handlePublish}
          onEditStep={goToStep}
        />
      )}
    </WizardShell>
  )
}

function currentStepTitle(
  step: number,
  t: DictionaryType["profilePage"]["createCourse"]
): string {
  switch (step) {
    case 1:
      return t.basicInfo.title
    case 2:
      return t.curriculum.title
    case 3:
      return t.pricing.title
    case 4:
      return t.media.title
    case 5:
      return t.review.title
    default:
      return t.createNewCourse
  }
}

function currentStepDescription(
  step: number,
  t: DictionaryType["profilePage"]["createCourse"]
): string {
  switch (step) {
    case 1:
      return t.basicInfo.description
    case 2:
      return t.curriculum.description
    case 3:
      return t.pricing.description
    case 4:
      return t.media.description
    case 5:
      return t.review.description ?? ""
    default:
      return ""
  }
}
