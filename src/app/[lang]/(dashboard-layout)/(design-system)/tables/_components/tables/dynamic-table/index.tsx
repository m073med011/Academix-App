"use client"

import { useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import type {
  DynamicColumn,
  DynamicFilter,
  DynamicTableProps,
  ViewMode,
} from "./types"

import { cn } from "@/lib/utils"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { renderCell } from "./cell-renderers"
import { DynamicTableCardView } from "./dynamic-table-card"
import { DynamicTableRowActions } from "./dynamic-table-row-actions"
import { DynamicTableToolbar } from "./dynamic-table-toolbar"
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
  rowIdKey = "id" as keyof T & string,
  onRowSelectionChange,
  cardGridCols = 3,
}: DynamicTableProps<T>) {
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

  // Build TanStack columns from DynamicColumn config
  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = []

    // Add select column if showCheckbox is true
    if (showCheckbox) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            className="ms-4"
            aria-label="Select all"
          />
        ),
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
      const filterFn =
        filter?.type === "number-range"
          ? (numberRangeFilter as FilterFn<T>)
          : filter?.type === "number"
            ? (numberEqualsFilter as FilterFn<T>)
            : filter?.type === "multi-select"
              ? "arrIncludesSome"
              : filter?.type === "select"
                ? "equalsString"
                : col.key === effectiveSearchColumn
                  ? "includesString"
                  : undefined

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

    // Add actions column if actions provided
    if (actions && actions.length > 0) {
      cols.push({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <DynamicTableRowActions row={row} actions={actions} />
        ),
        enableSorting: false,
        enableHiding: false,
      })
    }

    return cols
  }, [columns, actions, showCheckbox, filterMap, effectiveSearchColumn])

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater)
      // Call callback with selected rows
      if (onRowSelectionChange) {
        const newSelection =
          typeof updater === "function" ? updater(rowSelection) : updater
        const selectedRows = Object.keys(newSelection)
          .filter((key) => newSelection[key as keyof typeof newSelection])
          .map((key) => data[parseInt(key)])
          .filter(Boolean)
        onRowSelectionChange(selectedRows)
      }
    },
    getRowId: (row) => String(row[rowIdKey] ?? Math.random()),
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
    <Card>
      <CardHeader className="flex-row justify-between items-center gap-x-2 space-y-0 flex-wrap">
        <CardTitle>{title}</CardTitle>
        <DynamicTableToolbar
          table={table}
          data={data}
          columns={columns}
          searchable={searchable}
          searchColumn={effectiveSearchColumn}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          createButton={createButton}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </CardHeader>
      <CardContent className="p-0">
        {viewMode === "table" ? (
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const colorClass = colorize
                      ? getRowColorClass(
                          effectiveColorizeColumn
                            ? row.original[effectiveColorizeColumn]
                            : undefined,
                          colors
                        )
                      : ""
                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={cn(
                          row.getIsSelected() ? colorClass : "hover:bg-transparent"
                        )}
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
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={tableColumns.length}
                      className="h-24 text-center"
                    >
                      {noResultsMessage}
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
            noResultsMessage={noResultsMessage}
          />
        )}
      </CardContent>
      <CardFooter className="block py-3">
        <DataTablePagination table={table} />
      </CardFooter>
    </Card>
  )
}
