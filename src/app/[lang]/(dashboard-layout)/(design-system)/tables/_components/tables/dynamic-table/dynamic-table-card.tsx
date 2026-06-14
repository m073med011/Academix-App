"use client"

import type { Table } from "@tanstack/react-table"
import type { ActionItem, DynamicColumn } from "./types"

import { cn } from "@/lib/utils"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { renderCell } from "./cell-renderers"
import { DynamicTableRowActions } from "./dynamic-table-row-actions"
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
}: DynamicTableCardViewProps<T>) {
  const rows = table.getRowModel().rows
  const visibleColumns = table.getVisibleFlatColumns()

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
