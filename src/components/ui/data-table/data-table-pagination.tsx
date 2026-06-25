import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import type { Table } from "@tanstack/react-table"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  // Selectable page sizes (default: [10, 20, 30, 40, 50])
  pageSizeOptions?: number[]
  // Total row count for the denominator in server-side mode; defaults to the
  // current filtered client row count.
  rowCount?: number
  // i18n override for the "N of M row(s) selected." label
  rowsSelectedLabel?: (selected: number, total: number) => string
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50]

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  rowCount,
  rowsSelectedLabel,
}: DataTablePaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = rowCount ?? table.getFilteredRowModel().rows.length
  return (
    <div className="flex flex-col items-center justify-between gap-2 py-4 md:flex-row">
      <div className="flex-1 text-sm text-muted-foreground">
        {rowsSelectedLabel
          ? rowsSelectedLabel(selectedCount, totalCount)
          : `${selectedCount} of ${totalCount} row(s) selected.`}
      </div>
      <div className="flex items-center gap-x-6">
        <div className="hidden items-center gap-x-2 md:flex">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger
              className={
                (buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 w-fit gap-x-2 bg-background hover:bg-accent")
              }
            >
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" align="center">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-x-2 rtl:[&>button>svg]:-scale-100">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
