"use client"

import { useMemo } from "react"
import {
  Check,
  Eye,
  Hash,
  LayoutGrid,
  LayoutList,
  PlusCircle,
  Search,
  Trash2,
  X,
} from "lucide-react"

import type {
  DynamicTableToolbarProps,
  FacetedFilterProps,
  FilterOption,
  NumberFilterProps,
  ViewMode,
} from "./types"

import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { deriveFilterOptions, toNumber } from "./utils"

// ─── Faceted Filter ──────────────────────────────────────────────────────────
// Reusable dropdown filter for select / multi-select columns.

function FacetedFilter<T>({
  column,
  title,
  options,
  multiple = true,
}: FacetedFilterProps<T>) {
  const filterValue = column?.getFilterValue()
  const selectedValues = new Set(
    Array.isArray(filterValue)
      ? (filterValue as string[])
      : filterValue !== undefined && filterValue !== null
        ? [String(filterValue)]
        : []
  )

  const commitSelection = (next: Set<string>) => {
    if (multiple) {
      const arr = Array.from(next)
      column?.setFilterValue(arr.length ? arr : undefined)
    } else {
      const [first] = Array.from(next)
      column?.setFilterValue(first ?? undefined)
    }
  }

  const toggleOption = (value: string) => {
    const next = new Set(multiple ? selectedValues : [])
    if (selectedValues.has(value) && multiple) {
      next.delete(value)
    } else if (selectedValues.has(value) && !multiple) {
      next.clear()
    } else {
      next.add(value)
    }
    commitSelection(next)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          <PlusCircle className="me-2 h-4 w-4" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                  >
                    <div
                      className={cn(
                        "me-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    {option.icon && (
                      <option.icon className="me-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ─── Number Filter ───────────────────────────────────────────────────────────
// Popover filter for exact numbers or min/max ranges.

function NumberFilter<T>({
  column,
  title,
  mode = "range",
  min,
  max,
}: NumberFilterProps<T>) {
  const filterValue = column?.getFilterValue()

  if (mode === "number") {
    const current = typeof filterValue === "number" ? filterValue : undefined
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 border-dashed">
            <Hash className="me-2 h-4 w-4" />
            {title}
            {current !== undefined && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {current}
                </Badge>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] space-y-2 p-3" align="start">
          <Label className="text-xs text-muted-foreground">{title}</Label>
          <Input
            type="number"
            min={min}
            max={max}
            value={current ?? ""}
            onChange={(event) =>
              column?.setFilterValue(toNumber(event.target.value))
            }
            placeholder="Exact value"
          />
          {current !== undefined && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full"
              onClick={() => column?.setFilterValue(undefined)}
            >
              Clear
            </Button>
          )}
        </PopoverContent>
      </Popover>
    )
  }

  // Range mode
  const [low, high] = Array.isArray(filterValue)
    ? (filterValue as [number | undefined, number | undefined])
    : [undefined, undefined]
  const hasValue = low !== undefined || high !== undefined

  const setRange = (
    nextLow: number | undefined,
    nextHigh: number | undefined
  ) => {
    if (nextLow === undefined && nextHigh === undefined) {
      column?.setFilterValue(undefined)
    } else {
      column?.setFilterValue([nextLow, nextHigh])
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          <Hash className="me-2 h-4 w-4" />
          {title}
          {hasValue && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {low ?? "…"} - {high ?? "…"}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] space-y-2 p-3" align="start">
        <Label className="text-xs text-muted-foreground">{title}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={min}
            max={max}
            value={low ?? ""}
            onChange={(event) => setRange(toNumber(event.target.value), high)}
            placeholder="Min"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            min={min}
            max={max}
            value={high ?? ""}
            onChange={(event) => setRange(low, toNumber(event.target.value))}
            placeholder="Max"
          />
        </div>
        {hasValue && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-full"
            onClick={() => column?.setFilterValue(undefined)}
          >
            Clear
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────
// Main toolbar containing all tools: view toggle, column visibility,
// filters, reset, search, and create button.

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
  labels,
  onDeleteSelected,
}: DynamicTableToolbarProps<T>) {
  const searchColumnDef = columns.find((col) => col.key === searchColumn)
  const placeholder =
    searchPlaceholder ??
    `Search by ${searchColumnDef?.label ?? searchColumn}...`

  const isFiltered = table.getState().columnFilters.length > 0

  // Pre-compute auto-derived options for select filters once per data change,
  // instead of re-scanning the dataset on every render.
  const derivedOptions = useMemo(() => {
    const map = new Map<string, FilterOption[]>()
    filters?.forEach((filter) => {
      if (
        (filter.type === "select" || filter.type === "multi-select") &&
        !filter.options
      ) {
        map.set(filter.column, deriveFilterOptions(data, filter.column))
      }
    })
    return map
  }, [data, filters])

  const selectedRows = table.getFilteredSelectedRowModel().rows

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
            aria-label={labels?.toggleColumns ?? "Toggle columns"}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuLabel>
            {labels?.toggleColumns ?? "Toggle Columns"}
          </DropdownMenuLabel>
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
            filter.options ?? derivedOptions.get(filter.column) ?? []
          return (
            <FacetedFilter
              key={filter.column}
              column={column}
              title={label}
              options={options}
              multiple={filter.type === "multi-select"}
            />
          )
        }

        return (
          <NumberFilter
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
          {labels?.reset ?? "Reset"}
          <X className="ms-2 h-4 w-4" />
        </Button>
      )}

      {/* Search Input */}
      {searchable && (
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

      {/* Delete selected action */}
      {onDeleteSelected && selectedRows.length > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="h-9"
            >
              <Trash2 className="me-2 h-4 w-4" />
              Delete ({selectedRows.length})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the selected {selectedRows.length} item(s).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDeleteSelected(selectedRows.map((r) => r.original))}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
