"use client"

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

interface ActionBarProps {
  /** 1-indexed */
  activeStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  onPublish: () => void
  canContinue: boolean
  /** Short, plain-language explanation of why Continue is disabled. */
  blockingHint?: string
  isPublishing: boolean
  nextLabel?: string
  backLabel?: string
  publishLabel?: string
}

/**
 * ActionBar — the sticky bottom utility row. Three slots:
 *   [Back]    ·    Step n / N · optional validation hint    ·    [Continue / Publish]
 *
 * No decorative chrome. Logical properties so the arrow icons mirror in RTL.
 */
export function ActionBar({
  activeStep,
  totalSteps,
  onBack,
  onNext,
  onPublish,
  canContinue,
  blockingHint,
  isPublishing,
  nextLabel = "Continue",
  backLabel = "Back",
  publishLabel = "Publish course",
}: ActionBarProps) {
  const isLast = activeStep === totalSteps

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {/* Inline-start: Back button (hidden visually on step 1, kept for layout) */}
      <div className="flex min-w-[6.5rem] items-center">
        {activeStep > 1 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isPublishing}
            className="-ms-3"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
            {backLabel}
          </Button>
        ) : null}
      </div>

      {/* Center: step counter + blocking hint */}
      <div className="flex min-w-0 flex-1 flex-col items-center text-center">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Step {activeStep} of {totalSteps}
        </span>
        {!canContinue && blockingHint && !isLast ? (
          <span
            className={cn(
              "max-w-[28rem] truncate text-xs text-muted-foreground"
            )}
          >
            {blockingHint}
          </span>
        ) : null}
      </div>

      {/* Inline-end: Continue / Publish */}
      <div className="flex min-w-[6.5rem] items-center justify-end">
        {isLast ? (
          <Button
            type="button"
            onClick={onPublish}
            disabled={!canContinue || isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Publishing…
              </>
            ) : (
              publishLabel
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canContinue || isPublishing}
          >
            {nextLabel}
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Button>
        )}
      </div>
    </div>
  )
}
