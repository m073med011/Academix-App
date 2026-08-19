"use client"

import { useCallback, useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, X } from "lucide-react"

import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  FilterFnOption,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import type { DynamicFilter, DynamicTableProps, ViewMode } from "./types"

import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { renderCell } from "./cell-renderers"
import { DynamicTableCardView } from "./table-card"
import { DynamicTableDialog } from "./table-dialog"
import { RowContextMenu } from "./table-row-actions"
import { DynamicTableToolbar } from "./table-toolbar"
import { getRowColorClass } from "./utils"

// Alignment helpers shared by header and cells.
const alignClasses = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
} as const

// Range filter: keeps rows whose numeric value falls within [min, max].
// Either bound may be undefined (open-ended).
const numberRangeFilter: FilterFn<Record<string, unknown>> = (
  row,
  columnId,
  filterValue
) => {
  const [min, max] = (filterValue ?? []) as [
    number | undefined,
    number | undefined,
  ]
  const value = Number(row.getValue(columnId))
  if (Number.isNaN(value)) return false
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return true
}

// Exact-number filter.
const numberEqualsFilter: FilterFn<Record<string, unknown>> = (
  row,
  columnId,
  filterValue
) => {
  if (filterValue === undefined || filterValue === null) return true
  return Number(row.getValue(columnId)) === Number(filterValue)
}

// Build a lookup so we can attach the right filterFn to each column.
function buildFilterMap<T extends Record<string, unknown>>(
  filters: DynamicFilter<T>[] | undefined
) {
  const map = new Map<string, DynamicFilter<T>>()
  filters?.forEach((filter) => map.set(filter.column, filter))
  return map
}

// Resolve the TanStack filter function for a column based on its configured
// filter type, falling back to text search for the active search column.
function resolveFilterFn<T extends Record<string, unknown>>(
  filter: DynamicFilter<T> | undefined,
  columnKey: string,
  searchColumn: string
): FilterFnOption<T> | undefined {
  switch (filter?.type) {
    case "number-range":
      return numberRangeFilter as FilterFn<T>
    case "number":
      return numberEqualsFilter as FilterFn<T>
    case "multi-select":
      return "arrIncludesSome"
    case "select":
      return "equalsString"
    default:
      return columnKey === searchColumn ? "includesString" : undefined
  }
}

export function DynamicTable<T extends Record<string, unknown>>({
  data,
  columns,
  actions,
  showCheckbox = false,
  searchable = true,
  searchColumn,
  searchPlaceholder,
  filters,
  createButton,
  colorize = false,
  colorizeColumn,
  colors,
  defaultView = "table",
  defaultPageSize = 10,
  title = "Data Table",
  noResultsMessage = "No results.",
  isLoading = false,
  loadingView,
  rowIdKey = "id" as keyof T & string,
  onRowSelectionChange,
  cardGridCols = 3,
  labels,
  pageSizeOptions,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  pageCount,
  rowCount,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  dialog,
  children,
  onDeleteSelected,
}: DynamicTableProps<T>) {
  const resolvedNoResults = labels?.noResults ?? noResultsMessage
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      // Initialize hidden columns from column config
      const visibility: VisibilityState = {}
      columns.forEach((col) => {
        if (col.hidden) {
          visibility[col.key] = false
        }
      })
      return visibility
    }
  )
  const [rowSelection, setRowSelection] = useState({})
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView)

  // Determine search column (default to first column)
  const effectiveSearchColumn = searchColumn ?? columns[0]?.key ?? ""

  // Determine which column drives contextual coloring.
  const effectiveColorizeColumn =
    colorizeColumn ??
    columns.find((col) => col.component === "badge")?.key ??
    columns[0]?.key

  const filterMap = useMemo(() => buildFilterMap(filters), [filters])

  // When a dialog config is provided and the create button lacks its own
  // onClick handler, auto-wire the button to open the dialog.
  const resolvedCreateButton = useMemo(() => {
    if (!createButton) return undefined
    if (createButton.onClick) return createButton
    if (dialog) {
      return { ...createButton, onClick: () => dialog.onOpenChange(true) }
    }
    return createButton
  }, [createButton, dialog])

  // Build TanStack columns from DynamicColumn config
  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = []

    // Add select column if showCheckbox is true
    if (showCheckbox) {
      cols.push({
        id: "select",
        header: ({ table }) => {
          const selectedCount =
            table.getFilteredSelectedRowModel().rows.length
          const totalCount = table.getFilteredRowModel().rows.length
          const isAllSelected = table.getIsAllPageRowsSelected()
          const isSomeSelected = table.getIsSomePageRowsSelected()

          return (
            <div className="flex items-center gap-1 ms-4">
              <Checkbox
                checked={
                  isAllSelected || (isSomeSelected && "indeterminate")
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="inline-flex items-center gap-0.5 rounded p-0.5 hover:bg-muted transition-colors"
                    aria-label="Selection options"
                  >
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    {selectedCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="h-5 min-w-5 px-1 text-[10px] font-semibold rounded-sm"
                      >
                        {selectedCount}
                      </Badge>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[180px]">
                  <DropdownMenuItem
                    onClick={() =>
                      table.toggleAllPageRowsSelected(true)
                    }
                    disabled={isAllSelected}
                  >
                    Select all on page ({totalCount})
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      table.toggleAllRowsSelected(false)
                    }
                    disabled={selectedCount === 0}
                  >
                    <X className="me-2 h-3.5 w-3.5" />
                    Deselect all ({selectedCount})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            className="ms-4"
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      })
    }

    // Add data columns
    columns.forEach((col) => {
      const align = col.align ?? "start"
      const filter = filterMap.get(col.key)
      // Choose a filter function matching the column's filter config.
      const filterFn = resolveFilterFn(filter, col.key, effectiveSearchColumn)

      cols.push({
        id: col.key,
        accessorKey: col.key,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={col.label}
            className={alignClasses[align]}
          />
        ),
        cell: ({ row }) => {
          const value = row.getValue(col.key)
          return (
            <div className={alignClasses[align]}>
              {renderCell(value, row.original, col)}
            </div>
          )
        },
        enableSorting: col.sortable !== false,
        enableHiding: col.enableHiding !== false,
        ...(filterFn ? { filterFn } : {}),
      })
    })

    // Actions are now handled by right-click context menu (RowContextMenu)
    // wrapping each table row — no dedicated actions column needed.

    return cols
  }, [
    columns,
    showCheckbox,
    filterMap,
    effectiveSearchColumn,
  ])

  // Stable row id derived from rowIdKey. Falls back to the row's index so a
  // missing key never produces a random (and therefore unstable) id, which
  // would otherwise corrupt selection and React reconciliation.
  const getRowId = useCallback(
    (row: T, index: number) => {
      const id = row[rowIdKey]
      return id === null || id === undefined ? String(index) : String(id)
    },
    [rowIdKey]
  )

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    onSortingChange: (updater) => {
      setSorting(updater)
      if (onSortingChange) {
        onSortingChange(
          typeof updater === "function" ? updater(sorting) : updater
        )
      }
    },
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater)
      if (onColumnFiltersChange) {
        onColumnFiltersChange(
          typeof updater === "function" ? updater(columnFilters) : updater
        )
      }
    },
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater)
      // Notify the caller with the actual selected row objects. Selection keys
      // are row ids (from getRowId), not array indices, so we resolve them via
      // a stable id -> row lookup rather than indexing into `data`.
      if (onRowSelectionChange) {
        const newSelection =
          typeof updater === "function" ? updater(rowSelection) : updater
        const rowById = new Map(
          data.map((row, index) => [getRowId(row, index), row])
        )
        const selectedRows = Object.keys(newSelection)
          .filter((key) => newSelection[key as keyof typeof newSelection])
          .map((key) => rowById.get(key))
          .filter((row): row is T => row !== undefined)
        onRowSelectionChange(selectedRows)
      }
    },
    getRowId,
    manualPagination,
    manualSorting,
    manualFiltering,
    ...(pageCount !== undefined ? { pageCount } : {}),
    ...(rowCount !== undefined ? { rowCount } : {}),
    onPaginationChange: onPaginationChange
      ? (updater) => {
        const current = table.getState().pagination
        const next =
          typeof updater === "function" ? updater(current) : updater
        onPaginationChange(next)
      }
      : undefined,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
      },
    },
  })

  return (
    <>
    <Card>
      <CardHeader className="flex-row justify-between items-center gap-x-2 space-y-0 flex-wrap">
        <CardTitle>{title}</CardTitle>
        <DynamicTableToolbar
          table={table}
          data={data}
          columns={columns}
          searchable={searchable}
          searchColumn={effectiveSearchColumn}
          searchPlaceholder={searchPlaceholder ?? labels?.searchPlaceholder}
          filters={filters}
          createButton={resolvedCreateButton}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          labels={labels}
          onDeleteSelected={onDeleteSelected}
          showCheckbox={showCheckbox}
        />
      </CardHeader>
      <CardContent className="p-0">
        {(isLoading ? (loadingView ?? viewMode) : viewMode) === "table" ? (
          <ScrollArea
            orientation="horizontal"
            className="w-[calc(100vw-2.25rem)] md:w-auto"
          >
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={`skeleton-row-${rowIndex}`}>
                      {table.getVisibleLeafColumns().map((column) => (
                        <TableCell key={`skeleton-cell-${rowIndex}-${column.id}`}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const colorClass = colorize
                      ? getRowColorClass(
                        effectiveColorizeColumn
                          ? row.original[effectiveColorizeColumn]
                          : undefined,
                        colors
                      )
                      : ""
                    const tableRow = (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={cn(colorClass, "cursor-context-menu")}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )

                    // Wrap with right-click context menu for actions
                    if (actions && actions.length > 0) {
                      return (
                        <RowContextMenu
                          key={row.id}
                          data={row.original}
                          actions={actions}
                        >
                          {tableRow}
                        </RowContextMenu>
                      )
                    }

                    return tableRow
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={tableColumns.length}
                      className="h-24 text-center"
                    >
                      {resolvedNoResults}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <DynamicTableCardView
            table={table}
            columns={columns}
            actions={actions}
            showCheckbox={showCheckbox}
            gridCols={cardGridCols}
            colorize={colorize}
            colorizeColumn={effectiveColorizeColumn}
            colors={colors}
            noResultsMessage={resolvedNoResults}
            isLoading={isLoading}
          />
        )}
      </CardContent>
      <CardFooter className="block py-3">
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          rowCount={rowCount}
          rowsSelectedLabel={labels?.rowsSelected}
        />
      </CardFooter>
    </Card>

      {/* Built-in responsive dialog */}
      {dialog && (
        <DynamicTableDialog
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          title={dialog.title}
          description={dialog.description}
        >
          {children}
        </DynamicTableDialog>
      )}
    </>
  )
}
