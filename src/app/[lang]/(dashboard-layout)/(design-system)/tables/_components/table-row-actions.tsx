"use client"

import { EllipsisVertical } from "lucide-react"

import type { Row } from "@tanstack/react-table"
import type { ActionItem } from "./types"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DynamicTableRowActionsProps<T> {
  row: Row<T>
  actions: ActionItem<T>[]
}

export function DynamicTableRowActions<T>({
  row,
  actions,
}: DynamicTableRowActionsProps<T>) {
  const data = row.original

  // Filter out hidden actions
  const visibleActions = actions.filter((action) => {
    if (action.hidden === undefined) return true
    if (typeof action.hidden === "function") return !action.hidden(data)
    return !action.hidden
  })

  if (visibleActions.length === 0) return null

  return (
    <div className="flex justify-end me-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            aria-label="Open actions"
          >
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {visibleActions.map((action, index) => {
            const isDisabled =
              typeof action.disabled === "function"
                ? action.disabled(data)
                : action.disabled

            return (
              <div key={action.label}>
                {action.separator && index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={() => action.onClick(data)}
                  disabled={isDisabled}
                  className={
                    action.variant === "destructive"
                      ? "text-destructive focus:text-destructive"
                      : ""
                  }
                >
                  {action.icon && <action.icon className="me-2 h-4 w-4" />}
                  {action.label}
                </DropdownMenuItem>
              </div>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
