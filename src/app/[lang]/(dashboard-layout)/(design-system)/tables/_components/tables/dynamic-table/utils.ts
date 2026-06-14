import type { FilterOption } from "./types"

// Built-in contextual color palette. Keys are matched case-insensitively
// against a row's value, so common status words are colored out of the box.
// Callers can override or extend this via the `colors` prop.
export const DEFAULT_ROW_COLORS: Record<string, string> = {
  // Positive / success
  active: "bg-green-100 text-green-700 hover:bg-green-200",
  paid: "bg-green-100 text-green-700 hover:bg-green-200",
  success: "bg-green-100 text-green-700 hover:bg-green-200",
  approved: "bg-green-100 text-green-700 hover:bg-green-200",
  completed: "bg-green-100 text-green-700 hover:bg-green-200",
  // Warning / pending
  pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  warning: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  processing: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  // Negative / danger
  inactive: "bg-red-100 text-red-700 hover:bg-red-200",
  overdue: "bg-red-100 text-red-700 hover:bg-red-200",
  failed: "bg-red-100 text-red-700 hover:bg-red-200",
  rejected: "bg-red-100 text-red-700 hover:bg-red-200",
  cancelled: "bg-red-100 text-red-700 hover:bg-red-200",
}

// Resolve the contextual color classes for a row value.
// Looks in the caller-provided `colors` map first (exact, then lowercase),
// then falls back to the built-in palette. Returns "" when nothing matches.
export function getRowColorClass(
  value: unknown,
  colors?: Record<string, string>
): string {
  if (value === null || value === undefined) return ""
  const raw = String(value)
  const lower = raw.toLowerCase()

  if (colors) {
    if (raw in colors) return colors[raw]
    if (lower in colors) return colors[lower]
  }

  return DEFAULT_ROW_COLORS[lower] ?? ""
}

// Derive unique, sorted select options from the data for a given column.
// Used by the toolbar when a filter does not provide explicit `options`.
export function deriveFilterOptions<T extends Record<string, unknown>>(
  data: T[],
  key: keyof T & string
): FilterOption[] {
  const seen = new Set<string>()

  for (const row of data) {
    const value = row[key]
    if (value === null || value === undefined || value === "") continue
    seen.add(String(value))
  }

  return Array.from(seen)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }))
}
