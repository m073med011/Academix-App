"use client"

import { useMemo } from "react"
import Image from "next/image"
import { Check } from "lucide-react"

import type { Table } from "@tanstack/react-table"
import type { ActionItem, CardRole, DynamicColumn } from "./types"

import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { renderCell } from "./cell-renderers"
import { RowContextMenu } from "./table-row-actions"
import { getRowColorClass } from "./utils"

interface DynamicTableCardViewProps<T extends Record<string, unknown>> {
  table: Table<T>
  columns: DynamicColumn<T>[]
  actions?: ActionItem<T>[]
  showCheckbox?: boolean
  gridCols?: 1 | 2 | 3 | 4
  colorize?: boolean
  colorizeColumn?: keyof T & string
  colors?: Record<string, string>
  noResultsMessage?: string
  isLoading?: boolean
}

const gridColsClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
}

// ── Slot resolution ─────────────────────────────────────────────────────────

type SlotMap<T> = {
  cover?: DynamicColumn<T>
  title?: DynamicColumn<T>
  subtitle?: DynamicColumn<T>
  ownerImage?: DynamicColumn<T>
  ownerName?: DynamicColumn<T>
  badges: DynamicColumn<T>[]
  stats: DynamicColumn<T>[]
  rest: DynamicColumn<T>[]
  promotedKeys: Set<string>
}

/**
 * Resolves which visual slot each column fills.
 * Explicit `cardRole` wins; otherwise we auto-detect from component + key.
 */
function resolveSlots<T extends Record<string, unknown>>(
  columns: DynamicColumn<T>[]
): SlotMap<T> {
  const slots: SlotMap<T> = {
    badges: [],
    stats: [],
    rest: [],
    promotedKeys: new Set(),
  }

  // First pass: explicit cardRole assignments
  const unassigned: DynamicColumn<T>[] = []

  for (const col of columns) {
    if (col.cardRole) {
      assignToSlot(slots, col, col.cardRole)
    } else {
      unassigned.push(col)
    }
  }

  // Second pass: auto-detect from component / key for unassigned columns
  for (const col of unassigned) {
    const component = col.component ?? "text"
    const key = col.key.toLowerCase()

    // Skip system columns
    if (key === "actions" || key === "select") continue

    if (
      !slots.cover &&
      component === "image" &&
      (key.includes("cover") || key.includes("banner"))
    ) {
      assignToSlot(slots, col, "cover")
    } else if (
      !slots.ownerImage &&
      component === "avatar"
    ) {
      assignToSlot(slots, col, "owner-image")
    } else if (
      !slots.ownerName &&
      (key.includes("ownername") || key.includes("owner_name"))
    ) {
      assignToSlot(slots, col, "owner-name")
    } else if (
      !slots.title &&
      (component === "text" || component === "custom") &&
      key.includes("name") &&
      !key.includes("owner")
    ) {
      assignToSlot(slots, col, "title")
    } else if (component === "badge") {
      slots.badges.push(col)
      slots.promotedKeys.add(col.key)
    } else if (component === "number") {
      slots.stats.push(col)
      slots.promotedKeys.add(col.key)
    } else {
      slots.rest.push(col)
    }
  }

  return slots
}

function assignToSlot<T>(slots: SlotMap<T>, col: DynamicColumn<T>, role: CardRole) {
  switch (role) {
    case "cover":
      slots.cover = col
      break
    case "title":
      slots.title = col
      break
    case "subtitle":
      slots.subtitle = col
      break
    case "owner-image":
      slots.ownerImage = col
      break
    case "owner-name":
      slots.ownerName = col
      break
    case "stat":
      slots.stats.push(col)
      break
  }
  slots.promotedKeys.add(col.key)
}

// ── Loading skeleton ────────────────────────────────────────────────────────

function CardSkeleton({ showCheckbox }: { showCheckbox: boolean }) {
  return (
    <Card className="overflow-hidden border border-border/60">
      {/* Cover skeleton */}
      <Skeleton className="h-32 w-full rounded-none" />

      {/* Owner skeleton */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Stats skeleton */}
      <div className="grid grid-cols-4 gap-2 px-4 py-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`skel-stat-${i}`} className="space-y-1 text-center">
            <Skeleton className="mx-auto h-5 w-8" />
            <Skeleton className="mx-auto h-3 w-10" />
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      {showCheckbox && (
        <>
          <Separator />
          <div className="px-4 py-2.5">
            <Skeleton className="h-4 w-4 rounded-sm" />
          </div>
        </>
      )}
    </Card>
  )
}

// ── Cover image component ───────────────────────────────────────────────────

function CoverImage({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="h-32 w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
        <span className="text-3xl font-bold text-muted-foreground/30">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <div className="relative h-32 w-full overflow-hidden bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export function DynamicTableCardView<T extends Record<string, unknown>>({
  table,
  columns,
  actions,
  showCheckbox = false,
  gridCols = 3,
  colorize = false,
  colorizeColumn,
  colors,
  noResultsMessage = "No results.",
  isLoading = false,
}: DynamicTableCardViewProps<T>) {
  const rows = table.getRowModel().rows
  const visibleColumnIds = new Set(
    table.getVisibleFlatColumns().map((c) => c.id)
  )

  const slots = useMemo(() => resolveSlots(columns), [columns])
  const hasActions = !!actions && actions.length > 0

  // ── Loading state ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={cn("grid gap-4 p-4", gridColsClasses[gridCols])}>
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={`skeleton-card-${index}`} showCheckbox={showCheckbox} />
        ))}
      </div>
    )
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!rows.length) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        {noResultsMessage}
      </div>
    )
  }

  // Detail columns: visible, not promoted, not system
  const detailColumns = slots.rest.filter(
    (col) => visibleColumnIds.has(col.key) && col.key !== "actions"
  )

  // Visible stats
  const visibleStats = slots.stats.filter((col) => visibleColumnIds.has(col.key))

  return (
    <div className={cn("grid gap-4 p-4", gridColsClasses[gridCols])}>
      {rows.map((row) => {
        const data = row.original
        const colorClass = colorize
          ? getRowColorClass(
              colorizeColumn ? data[colorizeColumn] : undefined,
              colors
            )
          : ""

        const titleValue = slots.title
          ? String(data[slots.title.key] ?? "")
          : ""
        const coverSrc = slots.cover
          ? String(data[slots.cover.key] ?? "")
          : ""
        const ownerImageSrc = slots.ownerImage
          ? String(data[slots.ownerImage.key] ?? "")
          : ""
        const ownerNameValue = slots.ownerName
          ? String(data[slots.ownerName.key] ?? "")
          : ""
        const subtitleValue = slots.subtitle
          ? String(data[slots.subtitle.key] ?? "")
          : ""

        const cardContent = (
          <Card
            key={row.id}
            onClick={showCheckbox ? () => row.toggleSelected(!row.getIsSelected()) : undefined}
            className={cn(
              "group relative overflow-hidden border border-border/60 transition-all duration-200",
              showCheckbox && "cursor-pointer",
              "hover:shadow-md hover:border-primary/20",
              row.getIsSelected() &&
                "ring-2 ring-primary border-primary/30 bg-primary/[0.02]",
              colorClass
            )}
          >
            {/* ── Selected indicator overlay ──────────────────── */}
            {showCheckbox && row.getIsSelected() && (
              <div className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <Check className="h-3 w-3" />
              </div>
            )}
            {/* ── Cover Image ────────────────────────────────── */}
            {slots.cover && (
              <CoverImage src={coverSrc} alt={titleValue || "Cover"} />
            )}

            {/* ── Owner / Title Section ──────────────────────── */}
            <div className="flex items-start gap-3 px-4 pt-3 pb-2">
              {/* Owner avatar */}
              {(slots.ownerImage || slots.title) && (
                <Avatar className="h-9 w-9 shrink-0 border border-border/40">
                  <AvatarImage src={ownerImageSrc} alt={ownerNameValue || titleValue} />
                  <AvatarFallback className="text-xs font-medium">
                    {(ownerNameValue || titleValue).charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex-1 min-w-0 space-y-1">
                {/* Title — always plain text in card view */}
                {slots.title && (
                  <p className="text-sm font-semibold leading-snug truncate text-foreground">
                    {titleValue || String(data[slots.title.key] ?? "")}
                  </p>
                )}

                {/* Owner name + subtitle */}
                {(ownerNameValue || subtitleValue) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {ownerNameValue}
                    {ownerNameValue && subtitleValue && " · "}
                    {subtitleValue}
                  </p>
                )}

                {/* Badges */}
                {slots.badges.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {slots.badges.map((badgeCol) => (
                      <span key={badgeCol.key} className="inline-flex">
                        {renderCell(data[badgeCol.key], data, badgeCol)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Stats Row ──────────────────────────────────── */}
            {visibleStats.length > 0 && (
              <>
                <Separator />
                <div
                  className={cn(
                    "grid gap-1 px-4 py-2.5",
                    visibleStats.length <= 2
                      ? "grid-cols-2"
                      : visibleStats.length === 3
                        ? "grid-cols-3"
                        : "grid-cols-4"
                  )}
                >
                  {visibleStats.map((statCol) => {
                    const value = data[statCol.key]
                    return (
                      <div key={statCol.key} className="text-center min-w-0">
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {value === null || value === undefined
                            ? "—"
                            : typeof value === "number"
                              ? new Intl.NumberFormat().format(value)
                              : String(value)}
                        </p>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 truncate">
                          {statCol.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ── Detail Fields (remaining) ──────────────────── */}
            {detailColumns.length > 0 && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-2.5">
                  {detailColumns.map((col) => {
                    const value = data[col.key]
                    return (
                      <div key={col.key} className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-0.5">
                          {col.label}
                        </p>
                        <div className="text-xs text-foreground truncate">
                          {renderCell(value, data, col)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

          </Card>
        )

        // Wrap with context menu for right-click actions
        if (hasActions) {
          return (
            <RowContextMenu key={row.id} data={data} actions={actions}>
              {cardContent}
            </RowContextMenu>
          )
        }

        return cardContent
      })}
    </div>
  )
}
