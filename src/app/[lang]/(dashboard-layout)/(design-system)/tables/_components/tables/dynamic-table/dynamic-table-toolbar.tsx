"use client"

import { Eye, LayoutGrid, LayoutList, Search } from "lucide-react"

import type { Table } from "@tanstack/react-table"
import type { DynamicColumn, ViewMode } from "./types"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface DynamicTableToolbarProps<T extends Record<string, unknown>> {
  table: Table<T>
  columns: DynamicColumn<T>[]
  searchColumn: string
  searchPlaceholder?: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function DynamicTableToolbar<T extends Record<string, unknown>>({
  table,
  columns,
  searchColumn,
  searchPlaceholder,
  viewMode,
  onViewModeChange,
}: DynamicTableToolbarProps<T>) {
  const searchColumnDef = columns.find((col) => col.key === searchColumn)
  const placeholder =
    searchPlaceholder ??
    `Search by ${searchColumnDef?.label ?? searchColumn}...`

  return (
    <div className="flex items-center gap-2">
      {/* View Mode Toggle */}
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => {
          if (value) onViewModeChange(value as ViewMode)
        }}
        className="border rounded-md"
      >
        <ToggleGroupItem
          value="table"
          aria-label="Table view"
          className="h-9 w-9"
        >
          <LayoutList className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="card"
          aria-label="Card view"
          className="h-9 w-9"
        >
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Column Visibility */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Toggle columns"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide()
            )
            .map((column) => {
              const colDef = columns.find((c) => c.key === column.id)
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {colDef?.label ?? column.id.replace(/_/g, " ")}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name={`${searchColumn}-table-search`}
          autoComplete="off"
          placeholder={placeholder}
          className="ps-9 w-[200px] lg:w-[280px] border border-input bg-background"
          value={
            (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(searchColumn)?.setFilterValue(event.target.value)
          }
        />
      </div>
    </div>
  )
}
