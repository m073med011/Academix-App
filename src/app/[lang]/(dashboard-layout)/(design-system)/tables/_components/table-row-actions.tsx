"use client"

import type { ReactNode } from "react"
import type { Row } from "@tanstack/react-table"
import type { ActionItem } from "./types"
import { CheckSquare, Square } from "lucide-react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

// ── Shared content renderer ─────────────────────────────────────────────────

/**
 * Renders the action items inside a context-menu (or any menu).
 * Extracted so both card and table views share the same markup.
 */
function ActionMenuItems<T>({
  data,
  actions,
}: {
  data: T
  actions: ActionItem<T>[]
}) {
  // Filter out hidden actions
  const visibleActions = actions.filter((action) => {
    if (action.hidden === undefined) return true
    if (typeof action.hidden === "function") return !action.hidden(data)
    return !action.hidden
  })

  if (visibleActions.length === 0) return null

  return (
    <>
      {visibleActions.map((action, index) => {
        const isDisabled =
          typeof action.disabled === "function"
            ? action.disabled(data)
            : action.disabled

        return (
          <div key={action.label}>
            {action.separator && index > 0 && <ContextMenuSeparator />}
            <ContextMenuItem
              onClick={() => action.onClick(data)}
              disabled={isDisabled}
              variant={action.variant === "destructive" ? "destructive" : "default"}
            >
              {action.icon && <action.icon className="me-2 h-4 w-4" />}
              {action.label}
            </ContextMenuItem>
          </div>
        )
      })}
    </>
  )
}

// ── Context-menu wrapper ────────────────────────────────────────────────────

/**
 * Wraps `children` with a right-click context menu that shows row actions.
 * Used by both the table view (wrapping <TableRow>) and the card view (wrapping <Card>).
 */
export function RowContextMenu<T>({
  data,
  actions,
  children,
  isSelected,
  onToggleSelect,
}: {
  data: T
  actions: ActionItem<T>[]
  children: ReactNode
  isSelected?: boolean
  onToggleSelect?: () => void
}) {
  if (!actions || actions.length === 0) {
    return <>{children}</>
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-[180px]">
        {/* Selection toggle at the top */}
        {onToggleSelect !== undefined && (
          <>
            <ContextMenuItem onClick={onToggleSelect}>
              {isSelected ? (
                <>
                  <Square className="me-2 h-4 w-4" />
                  Deselect
                </>
              ) : (
                <>
                  <CheckSquare className="me-2 h-4 w-4" />
                  Select
                </>
              )}
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ActionMenuItems data={data} actions={actions} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ── Legacy row-actions (kept for backward compat, now just a thin wrapper) ──

interface DynamicTableRowActionsProps<T> {
  row: Row<T>
  actions: ActionItem<T>[]
}

/**
 * @deprecated Use `RowContextMenu` instead. This component is kept for
 * backward compatibility but no longer renders a visible trigger button —
 * the context menu is triggered by right-click on the row/card.
 */
export function DynamicTableRowActions<T>({
  row,
  actions,
}: DynamicTableRowActionsProps<T>) {
  // No-op: actions are now handled by RowContextMenu wrapping the row/card.
  // This stub is kept so existing imports don't break during migration.
  return null
}
