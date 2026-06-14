"use client"

import { Hash } from "lucide-react"

import type { Column } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface DynamicTableNumberFilterProps<T> {
  column?: Column<T, unknown>
  title: string
  // "number" = single exact value, "range" = min/max bounds
  mode?: "number" | "range"
  min?: number
  max?: number
}

// Parse an input string into a number or undefined (blank = no bound).
function toNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

// Dynamic number filter. Renders inside a popover; writes either a single
// number (exact) or a [min, max] tuple (range) as the column filter value.
export function DynamicTableNumberFilter<T>({
  column,
  title,
  mode = "range",
  min,
  max,
}: DynamicTableNumberFilterProps<T>) {
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
