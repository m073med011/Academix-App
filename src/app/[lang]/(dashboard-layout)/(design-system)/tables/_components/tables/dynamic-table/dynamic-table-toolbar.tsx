"use client"

import { Eye, LayoutGrid, LayoutList, Search, X } from "lucide-react"

import type { Table } from "@tanstack/react-table"
import type {
  CreateButtonConfig,
  DynamicColumn,
  DynamicFilter,
  ViewMode,
} from "./types"

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
import { DynamicTableFacetedFilter } from "./dynamic-table-faceted-filter"
import { DynamicTableNumberFilter } from "./dynamic-table-number-filter"
import { deriveFilterOptions } from "./utils"

interface DynamicTableToolbarProps<T extends Record<string, unknown>> {
  table: Table<T>
  data: T[]
  columns: DynamicColumn<T>[]
  searchable: boolean
  searchColumn: string
  searchPlaceholder?: string
  filters?: DynamicFilter<T>[]
  createButton?: CreateButtonConfig
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function DynamicTableToolbar<T extends Record<string, unknown>>({
  table,
  data,
  columns,
  searchable,
  searchColumn,
  searchPlaceholder,
  filters,
  createButton,
  viewMode,
  onViewModeChange,
}: DynamicTableToolbarProps<T>) {
  const searchColumnDef = columns.find((col) => col.key === searchColumn)
  const placeholder =
    searchPlaceholder ??
    `Search by ${searchColumnDef?.label ?? searchColumn}...`

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
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

      {/* Dynamic Filters */}
      {filters?.map((filter) => {
        const column = table.getColumn(filter.column)
        if (!column) return null

        const label =
          filter.label ??
          columns.find((c) => c.key === filter.column)?.label ??
          filter.column

        if (filter.type === "select" || filter.type === "multi-select") {
          const options =
            filter.options ?? deriveFilterOptions(data, filter.column)
          return (
            <DynamicTableFacetedFilter
              key={filter.column}
              column={column}
              title={label}
              options={options}
              multiple={filter.type === "multi-select"}
            />
          )
        }

        return (
          <DynamicTableNumberFilter
            key={filter.column}
            column={column}
            title={label}
            mode={filter.type === "number" ? "number" : "range"}
            min={filter.min}
            max={filter.max}
          />
        )
      })}

      {/* Reset filters */}
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 lg:px-3"
          onClick={() => table.resetColumnFilters()}
        >
          Reset
          <X className="ms-2 h-4 w-4" />
        </Button>
      )}

      {/* Search Input */}
      {searchable && (
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
      )}

      {/* Create / primary action */}
      {createButton && (
        <Button
          variant={createButton.variant ?? "default"}
          size="sm"
          className="h-9"
          disabled={createButton.disabled}
          onClick={createButton.onClick}
        >
          {createButton.icon && <createButton.icon className="me-2 h-4 w-4" />}
          {createButton.label}
        </Button>
      )}
    </div>
  )
}
