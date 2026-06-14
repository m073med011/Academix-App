"use client"

import Image from "next/image"
import { Download, ExternalLink, Mail } from "lucide-react"

import type { DynamicColumn } from "./types"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

// Format number with thousands separator
function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

// Format currency
function formatCurrency(value: number, symbol = "$"): string {
  return `${symbol}${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`
}

// Format percentage
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

// Format date
function formatDate(value: string | Date, includeTime = false): string {
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return "-"

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
  }

  return date.toLocaleDateString(undefined, options)
}

// Get initials from text
function getInitials(text: string): string {
  return text
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Cell renderer factory
export function renderCell<T extends Record<string, unknown>>(
  value: unknown,
  row: T,
  column: DynamicColumn<T>
): React.ReactNode {
  // Handle custom renderer
  if (column.render) {
    return column.render(value, row)
  }

  // Handle null/undefined
  if (value === null || value === undefined) {
    return (
      <span className="text-muted-foreground">{column.placeholder ?? "-"}</span>
    )
  }

  switch (column.component ?? "text") {
    case "text":
      return <span className="line-clamp-2">{String(value)}</span>

    case "number":
      return (
        <span className="tabular-nums">
          {typeof value === "number" ? formatNumber(value) : String(value)}
        </span>
      )

    case "currency":
      return (
        <span className="tabular-nums font-medium">
          {typeof value === "number"
            ? formatCurrency(value, column.currencySymbol)
            : String(value)}
        </span>
      )

    case "percentage":
      return (
        <span className="tabular-nums">
          {typeof value === "number" ? formatPercentage(value) : String(value)}
        </span>
      )

    case "image": {
      const size = column.imageSize ?? { width: 40, height: 40 }
      return (
        <div className="relative overflow-hidden rounded-md" style={size}>
          <Image
            src={String(value)}
            alt=""
            fill
            className="object-cover"
            sizes={`${size.width}px`}
          />
        </div>
      )
    }

    case "avatar": {
      const size = column.imageSize ?? { width: 32, height: 32 }
      const src = String(value)
      return (
        <Avatar style={size}>
          <AvatarImage src={src} alt="" />
          <AvatarFallback className="text-xs">
            {getInitials(src.split("/").pop() ?? "?")}
          </AvatarFallback>
        </Avatar>
      )
    }

    case "file":
      return (
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2" asChild>
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Download className="h-4 w-4" />
            <span className="max-w-[100px] truncate">
              {String(value).split("/").pop() ?? "Download"}
            </span>
          </a>
        </Button>
      )

    case "toggle":
      return (
        <Switch checked={Boolean(value)} disabled aria-label={column.label} />
      )

    case "date":
      return (
        <span className="text-muted-foreground">
          {formatDate(value as string | Date, false)}
        </span>
      )

    case "datetime":
      return (
        <span className="text-muted-foreground">
          {formatDate(value as string | Date, true)}
        </span>
      )

    case "badge": {
      const variant = column.getBadgeVariant
        ? column.getBadgeVariant(value)
        : "default"
      return <Badge variant={variant}>{String(value)}</Badge>
    }

    case "email":
      return (
        <a
          href={`mailto:${String(value)}`}
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          <Mail className="h-3.5 w-3.5" />
          <span className="max-w-[180px] truncate">{String(value)}</span>
        </a>
      )

    case "link":
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          <span className="max-w-[180px] truncate">{String(value)}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )

    case "custom":
      // Custom type requires render function
      return <span>{String(value)}</span>

    default:
      return <span>{String(value)}</span>
  }
}
