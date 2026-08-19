"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * WizardShell — the page-level chrome for the course create flow.
 *
 * Editorial two-column on lg+: a sticky rail (slot) on the inline-start side,
 * a max-width content column on the other. The shell adds the sticky action
 * bar (slot) underneath. No card chrome; depth comes from hairlines and
 * tonal layering, per DESIGN.md (Flat-By-Default Rule).
 *
 * RTL: pure logical properties; rail flips with the document direction.
 */
interface WizardShellProps {
  header: React.ReactNode
  rail: React.ReactNode
  children: React.ReactNode
  actionBar: React.ReactNode
}

export function WizardShell({
  header,
  rail,
  children,
  actionBar,
}: WizardShellProps) {
  return (
    /*
      Outer is a flex column that fills the dashboard <main> region. The
      dashboard <main> already enforces min-h-[calc(100svh-6.82rem)], so
      we only need to inherit that height (h-full) — adding another
      min-height here stacks against the parent and can push the page
      column past its intended width, which made the layout's sidebar
      shift. The shell stays inside the page column and never touches
      the sidebar.
    */
    <div className="flex h-full min-h-full w-full flex-col">
      {/* Page header — sits above both rail and content */}
      <div className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {header}
        </div>
      </div>

      {/* Two-column body. Bottom padding reserves space for the sticky action bar. */}
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 py-10 lg:grid-cols-[14rem_1fr] lg:gap-16">
          {/* Inline-start rail. On <lg this stacks above the content. */}
          <aside className="lg:sticky lg:top-20 lg:self-start">{rail}</aside>

          {/* Content column, anchored to a comfortable measure. */}
          <main className="min-w-0">
            <div className="mx-auto w-full max-w-2xl">{children}</div>
          </main>
        </div>
      </div>

      {/*
        Action bar — sticky to the bottom of the page column (not the
        viewport, not the layout). It pins to the bottom of the visible
        viewport while the page is on screen, releases when the user
        scrolls past so the dashboard footer can surface. Stays inside
        the page column's width, never under the sidebar.
      */}
      <div className="sticky bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {actionBar}
        </div>
      </div>
    </div>
  )
}

/**
 * Section — replaces the per-section <Card> nesting. A typographic block:
 * eyebrow + optional caption, then the field content. Sections are separated
 * by a hairline rather than wrapped in cards.
 */
interface SectionProps {
  eyebrow: string
  caption?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Section({ eyebrow, caption, children, className }: SectionProps) {
  return (
    <section className={cn("flex flex-col gap-6", className)}>
      <header className="flex flex-col gap-1">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {eyebrow}
        </h2>
        {caption ? (
          typeof caption === "string" ? (
            <p className="text-sm text-muted-foreground">{caption}</p>
          ) : (
            <div className="text-sm text-muted-foreground">{caption}</div>
          )
        ) : null}
      </header>
      {children}
    </section>
  )
}

/**
 * Field — label + control + optional helper / error, vertical, gap-2 tight.
 * Replaces the ad-hoc <div className="flex flex-col gap-2"> repeated everywhere.
 */
interface FieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
