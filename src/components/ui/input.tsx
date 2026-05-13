import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export function Input({ className, wrapperClassName, type, ...props }: ComponentProps<"input"> & { wrapperClassName?: string }) {
  return (
    <div className={cn("w-full px-1", wrapperClassName)}>
      <input
        data-slot="input"
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}
