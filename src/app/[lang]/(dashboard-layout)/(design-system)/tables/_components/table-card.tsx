"use client"

import type { Table } from "@tanstack/react-table"
import type { ActionItem, DynamicColumn } from "./types"

import { cn } from "@/lib/utils"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { renderCell } from "./cell-renderers"
import { DynamicTableRowActions } from "./table-row-actions"
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
  const visibleColumns = table.getVisibleFlatColumns()

  if (isLoading) {
    return (
      <div className={cn("grid gap-4 p-4", gridColsClasses[gridCols])}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={`skeleton-card-${index}`} className="relative transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                {showCheckbox ? <Skeleton className="h-4 w-4" /> : <div />}
                {actions && actions.length > 0 && <Skeleton className="h-8 w-8 rounded-md" />}
              </div>
              <div className="space-y-3 mt-4">
                {visibleColumns
                  .filter((col) => col.id !== "select" && col.id !== "actions")
                  .map((col) => (
                    <div key={col.id} className="flex items-center justify-between gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        {noResultsMessage}
      </div>
    )
  }

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

        return (
          <Card
            key={row.id}
            className={cn(
              "relative transition-all hover:shadow-md",
              row.getIsSelected() && "ring-2 ring-primary",
              colorClass
            )}
          >
            <CardContent className="p-4">
              {/* Header with checkbox and actions */}
              <div className="flex items-center justify-between mb-3">
                {showCheckbox ? (
                  <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                  />
                ) : (
                  <div />
                )}
                {actions && actions.length > 0 && (
                  <DynamicTableRowActions row={row} actions={actions} />
                )}
              </div>

              {/* Card content - visible columns */}
              <div className="space-y-2">
                {visibleColumns
                  .filter((col) => {
                    // Skip select and actions columns
                    return col.id !== "select" && col.id !== "actions"
                  })
                  .map((visibleCol) => {
                    const columnDef = columns.find(
                      (c) => c.key === visibleCol.id
                    )
                    if (!columnDef) return null

                    const value = data[columnDef.key]

                    return (
                      <div
                        key={visibleCol.id}
                        className="flex items-start justify-between gap-2"
                      >
                        <span className="text-sm font-medium text-muted-foreground shrink-0">
                          {columnDef.label}:
                        </span>
                        <div className="text-sm text-end">
                          {renderCell(value, data, columnDef)}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
