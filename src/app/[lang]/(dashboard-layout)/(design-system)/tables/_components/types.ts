import type {
  Column,
  ColumnFiltersState,
  SortingState,
  Table,
} from "@tanstack/react-table"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

// Supported cell components for rendering a column's value.
// Pass the matching name on a column, e.g. { key: "status", component: "badge" }.
export type ColumnComponent =
  | "text"
  | "number"
  | "currency"
  | "percentage"
  | "image"
  | "avatar"
  | "file"
  | "toggle"
  | "date"
  | "datetime"
  | "badge"
  | "email"
  | "link"
  | "custom"

// Badge variant types
export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"

// Horizontal alignment for a column's cells and header
export type ColumnAlign = "start" | "center" | "end"

// Column configuration interface. Only `key` and `label` are required;
// everything else is optional so a column can be as simple as
// { key: "name", label: "Name" }.
export interface DynamicColumn<T> {
  // Unique key matching the data property
  key: keyof T & string
  // Display label for the column header
  label: string
  // Cell component used to render the value (default: "text")
  component?: ColumnComponent
  // Enable sorting for this column (default: true)
  sortable?: boolean
  // Hide column by default
  hidden?: boolean
  // Disable hiding this column
  enableHiding?: boolean
  // Horizontal alignment (default: "start")
  align?: ColumnAlign
  // Custom render function for "custom" component or to override the default
  render?: (value: unknown, row: T) => ReactNode
  // Badge variant getter for "badge" component
  getBadgeVariant?: (value: unknown) => BadgeVariant
  // Currency symbol for "currency" component (default: "$")
  currencySymbol?: string
  // Date format for "date"/"datetime" component
  dateFormat?: string
  // Image size for "image"/"avatar" component
  imageSize?: { width: number; height: number }
  // Placeholder for empty values
  placeholder?: string
}

// Action item configuration
export interface ActionItem<T> {
  // Action label
  label: string
  // Icon component (lucide-react)
  icon?: LucideIcon
  // Click handler with row data
  onClick: (row: T) => void
  // Button variant for styling
  variant?: "default" | "destructive"
  // Show separator before this action
  separator?: boolean
  // Disable condition
  disabled?: boolean | ((row: T) => boolean)
  // Hide condition
  hidden?: boolean | ((row: T) => boolean)
}

// View mode type
export type ViewMode = "table" | "card"

// User-facing strings. Defaults are English; pass overrides for i18n.
export interface DynamicTableLabels {
  actions?: string
  toggleColumns?: string
  reset?: string
  noResults?: string
  searchPlaceholder?: string
  rowsSelected?: (selected: number, total: number) => string
}

// Reusable "create" / primary action button shown in the toolbar.
export interface CreateButtonConfig {
  // Button label
  label: string
  // Optional leading icon (lucide-react)
  icon?: LucideIcon
  // Click handler (open a modal, navigate, etc.)
  // Optional when a `dialog` config is provided — the table auto-wires the
  // create button to open the dialog.
  onClick?: () => void
  // Button variant (default: "default")
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive"
  // Disable the button
  disabled?: boolean
}

// Responsive dialog configuration.
// When provided, the DynamicTable renders a built-in responsive dialog
// (Dialog on desktop, Drawer on mobile) whose body is the table's `children`.
export interface DialogConfig {
  // Controlled open state
  open: boolean
  // Callback to toggle the dialog
  onOpenChange: (open: boolean) => void
  // Dialog / drawer title
  title: string
  // Optional description shown below the title
  description?: string
}

// Supported toolbar filter types
export type FilterType = "select" | "multi-select" | "number" | "number-range"

// Option shown inside a select / multi-select filter dropdown
export interface FilterOption {
  label: string
  value: string
  icon?: LucideIcon
}

// Table-level filter configuration (kept separate from column defs).
// Options for select filters are auto-derived from the data when omitted.
export interface DynamicFilter<T> {
  // Column key this filter targets
  column: keyof T & string
  // Filter behaviour
  type: FilterType
  // Trigger label (defaults to the column's label or key)
  label?: string
  // Explicit options for "select"/"multi-select" (auto-derived if omitted)
  options?: FilterOption[]
  // Bounds hint for "number"/"number-range" inputs
  min?: number
  max?: number
}

// Main DynamicTable props. Everything except `data` and `columns` is optional.
export interface DynamicTableProps<T extends Record<string, unknown>> {
  // Data array
  data: T[]
  // Column configurations
  columns: DynamicColumn<T>[]
  // Row actions (optional - if not provided, actions column hidden)
  actions?: ActionItem<T>[]
  // Show row selection checkboxes (default: false)
  showCheckbox?: boolean
  // Show the search box (default: true)
  searchable?: boolean
  // Column key to search by (default: first column after checkbox)
  searchColumn?: keyof T & string
  // Search placeholder text
  searchPlaceholder?: string
  // Toolbar filters (dropdown / number filters)
  filters?: DynamicFilter<T>[]
  // Optional create / primary action button in the toolbar
  createButton?: CreateButtonConfig
  // Enable contextual row coloring (default: false)
  colorize?: boolean
  // Column whose value drives the row color
  // (defaults to the first "badge" column, else the first column)
  colorizeColumn?: keyof T & string
  // Map of value -> tailwind classes; falls back to a built-in palette
  colors?: Record<string, string>
  // Default view mode (default: "table")
  defaultView?: ViewMode
  // Page size options (default: [10, 20, 30, 40, 50])
  pageSizeOptions?: number[]
  // Default page size (default: 10)
  defaultPageSize?: number
  // Table title (optional)
  title?: string
  // No results message
  noResultsMessage?: string
  // Show a loading state in place of rows (e.g. while fetching server data)
  isLoading?: boolean
  // Override the view mode specifically for the loading skeleton
  loadingView?: ViewMode
  // Unique row identifier key (default: "id")
  rowIdKey?: keyof T & string
  // Enable row selection change callback
  onRowSelectionChange?: (selectedRows: T[]) => void
  // Card grid columns (default: 3)
  cardGridCols?: 1 | 2 | 3 | 4
  // User-facing string overrides (i18n)
  labels?: DynamicTableLabels
  // --- Server-side mode (optional) ---
  // When true, pagination/sorting/filtering are delegated to the caller and
  // `data` is treated as the current page only. Provide pageCount/rowCount and
  // wire the on*Change callbacks to refetch from the server.
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  // Total page count (required when manualPagination is true)
  pageCount?: number
  // Total row count across all pages (server-side row(s)-selected display)
  rowCount?: number
  // Notified when pagination state changes (page index / size)
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void
  // Notified when sorting state changes
  onSortingChange?: (sorting: SortingState) => void
  // Notified when column filters change
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  // Built-in responsive dialog configuration.
  // When set, the table renders a Dialog (desktop) / Drawer (mobile) whose
  // body is whatever you pass as `children`.
  dialog?: DialogConfig
  // Content rendered inside the built-in dialog (forms, confirm prompts, etc.)
  children?: ReactNode
  // Callback when delete selected button is clicked. If provided, a delete button will appear when rows are selected.
  onDeleteSelected?: (selectedRows: T[]) => void
}

// ─── Toolbar sub-component props ────────────────────────────────────────────

// Props for the faceted (select / multi-select) filter popover.
export interface FacetedFilterProps<T> {
  column?: Column<T, unknown>
  title: string
  options: FilterOption[]
  // Allow selecting multiple values (default: true)
  multiple?: boolean
}

// Props for the number / number-range filter popover.
export interface NumberFilterProps<T> {
  column?: Column<T, unknown>
  title: string
  // "number" = single exact value, "range" = min/max bounds
  mode?: "number" | "range"
  min?: number
  max?: number
}

// Props for the main toolbar component.
export interface DynamicTableToolbarProps<T extends Record<string, unknown>> {
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
  labels?: DynamicTableLabels
  onDeleteSelected?: (selectedRows: T[]) => void
}
