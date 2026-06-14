"use client"

import { Check, PlusCircle } from "lucide-react"

import type { Column } from "@tanstack/react-table"
import type { FilterOption } from "./types"

import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface DynamicTableFacetedFilterProps<T> {
  column?: Column<T, unknown>
  title: string
  options: FilterOption[]
  // Allow selecting multiple values (default: true)
  multiple?: boolean
}

// Reusable dropdown filter used by the toolbar for every select column.
// Works for single ("select") and multi ("multi-select") modes.
export function DynamicTableFacetedFilter<T>({
  column,
  title,
  options,
  multiple = true,
}: DynamicTableFacetedFilterProps<T>) {
  const filterValue = column?.getFilterValue()
  // Normalize the current value to a Set for easy membership checks.
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
