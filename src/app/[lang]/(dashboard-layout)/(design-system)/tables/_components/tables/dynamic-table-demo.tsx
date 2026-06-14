"use client"

import { toast } from "sonner"
import { Copy, Pencil, Trash2 } from "lucide-react"

import type { SampleUser } from "../../_data/sample-users"
import type {
  ActionItem,
  BadgeVariant,
  DynamicColumn,
  DynamicFilter,
} from "./dynamic-table/types"

import { sampleUsers } from "../../_data/sample-users"

import { DynamicTable } from "./dynamic-table"

// Column configuration. Each column names the `component` used to render it.
const userColumns: DynamicColumn<SampleUser>[] = [
  {
    key: "name",
    label: "Name",
    component: "text",
  },
  {
    key: "avatar",
    label: "Avatar",
    component: "avatar",
    sortable: false,
    imageSize: { width: 32, height: 32 },
  },
  {
    key: "email",
    label: "Email",
    component: "email",
  },
  {
    key: "role",
    label: "Role",
    component: "badge",
    getBadgeVariant: (value): BadgeVariant => {
      switch (value) {
        case "Manager":
          return "default"
        case "Developer":
          return "secondary"
        case "Designer":
          return "outline"
        default:
          return "default"
      }
    },
  },
  {
    key: "status",
    label: "Status",
    component: "badge",
    getBadgeVariant: (value): BadgeVariant => {
      switch (value) {
        case "Active":
          return "success"
        case "Inactive":
          return "destructive"
        case "Pending":
          return "warning"
        default:
          return "default"
      }
    },
  },
  {
    key: "salary",
    label: "Salary",
    component: "currency",
    align: "end",
    currencySymbol: "$",
  },
  {
    key: "percentage",
    label: "Performance",
    component: "percentage",
    align: "end",
  },
  {
    key: "isVerified",
    label: "Verified",
    component: "toggle",
    sortable: false,
  },
  {
    key: "joinedAt",
    label: "Joined",
    component: "date",
    hidden: true, // Hidden by default
  },
  {
    key: "document",
    label: "Document",
    component: "file",
    sortable: false,
    hidden: true, // Hidden by default
  },
]

// Table-level filters (kept separate from column defs).
// Select options are auto-derived from the data when not provided.
const userFilters: DynamicFilter<SampleUser>[] = [
  { column: "role", type: "multi-select" },
  { column: "status", type: "multi-select" },
  { column: "salary", type: "number-range", label: "Salary", min: 0 },
]

// Contextual row colors keyed by status value (overrides built-in defaults).
const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700 hover:bg-green-200",
  Pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  Inactive: "bg-red-100 text-red-700 hover:bg-red-200",
}

// Action handlers
const handleEdit = (user: SampleUser) => {
  toast.info(`Editing: ${user.name}`)
}

const handleCopy = (user: SampleUser) => {
  toast.success(`Copied: ${user.id}`)
}

const handleDelete = (user: SampleUser) => {
  toast.error(`Delete: ${user.name}`)
}

// Actions configuration
const userActions: ActionItem<SampleUser>[] = [
  {
    label: "Edit",
    icon: Pencil,
    onClick: handleEdit,
  },
  {
    label: "Copy ID",
    icon: Copy,
    onClick: handleCopy,
  },
  {
    label: "Delete",
    icon: Trash2,
    onClick: handleDelete,
    variant: "destructive",
    separator: true,
  },
]

export function DynamicTableDemo() {
  return (
    <DynamicTable<SampleUser>
      data={sampleUsers}
      columns={userColumns}
      actions={userActions}
      showCheckbox
      searchable
      searchColumn="name"
      searchPlaceholder="Search by name..."
      filters={userFilters}
      colorize
      colorizeColumn="status"
      colors={statusColors}
      defaultView="table"
      title="Dynamic Table"
      cardGridCols={3}
    />
  )
}
