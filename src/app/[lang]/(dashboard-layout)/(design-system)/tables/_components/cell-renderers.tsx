"use client"

import Image from "next/image"
import { Download, ExternalLink, Mail } from "lucide-react"

import type { ColumnComponent, DynamicColumn } from "./types"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { sanitizeEmail, sanitizeUrl } from "./utils"

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

// Get initials from a human-readable label (first letters of up to two words).
function getInitials(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Arguments passed to every registered renderer.
interface RenderArgs<T extends Record<string, unknown>> {
  value: unknown
  row: T
  column: DynamicColumn<T>
}

// Renderer registry: maps a ColumnComponent name to its render function.
// Add a new cell type by registering it here and extending ColumnComponent —
// no need to touch the dispatch logic in renderCell.
const renderers: Record<
  ColumnComponent,
  <T extends Record<string, unknown>>(args: RenderArgs<T>) => React.ReactNode
> = {
  text: ({ value }) => <span className="line-clamp-2">{String(value)}</span>,

  number: ({ value }) => (
    <span className="tabular-nums">
      {typeof value === "number" ? formatNumber(value) : String(value)}
    </span>
  ),

  currency: ({ value, column }) => (
    <span className="tabular-nums font-medium">
      {typeof value === "number"
        ? formatCurrency(value, column.currencySymbol)
        : String(value)}
    </span>
  ),

  percentage: ({ value }) => (
    <span className="tabular-nums">
      {typeof value === "number" ? formatPercentage(value) : String(value)}
    </span>
  ),

  image: ({ value, column }) => {
    const src = sanitizeUrl(value)
    const size = column.imageSize ?? { width: 40, height: 40 }
    if (!src) {
      return <span className="text-muted-foreground">-</span>
    }
    return (
      <div className="relative overflow-hidden rounded-md" style={size}>
        <Image
          src={src}
          alt={column.label}
          fill
          className="object-cover"
          sizes={`${size.width}px`}
        />
      </div>
    )
  },

  avatar: ({ value, row, column }) => {
    const size = column.imageSize ?? { width: 32, height: 32 }
    const src = sanitizeUrl(value)
    // Prefer a sibling "name" field for initials; fall back to the label.
    const nameSource =
      typeof row.name === "string" && row.name.trim() !== ""
        ? row.name
        : column.label
    return (
      <Avatar style={size}>
        {src && <AvatarImage src={src} alt={nameSource} />}
        <AvatarFallback className="text-xs">
          {getInitials(nameSource) || "?"}
        </AvatarFallback>
      </Avatar>
    )
  },

  file: ({ value }) => {
    const href = sanitizeUrl(value)
    if (!href) {
      return <span className="text-muted-foreground">-</span>
    }
    return (
      <Button variant="ghost" size="sm" className="h-8 gap-2 px-2" asChild>
        <a href={href} target="_blank" rel="noopener noreferrer" download>
          <Download className="h-4 w-4" />
          <span className="max-w-[100px] truncate">
            {href.split("/").pop() || "Download"}
          </span>
        </a>
      </Button>
    )
  },

  toggle: ({ value, column }) => (
    <Switch checked={Boolean(value)} disabled aria-label={column.label} />
  ),

  date: ({ value }) => (
    <span className="text-muted-foreground">
      {formatDate(value as string | Date, false)}
    </span>
  ),

  datetime: ({ value }) => (
    <span className="text-muted-foreground">
      {formatDate(value as string | Date, true)}
    </span>
  ),

  badge: ({ value, column }) => {
    const variant = column.getBadgeVariant
      ? column.getBadgeVariant(value)
      : "default"
    return <Badge variant={variant}>{String(value)}</Badge>
  },

  email: ({ value }) => {
    const email = sanitizeEmail(value)
    if (!email) {
      return <span className="text-muted-foreground">{String(value)}</span>
    }
    return (
      <a
        href={`mailto:${encodeURIComponent(email)}`}
        className="inline-flex items-center gap-1.5 text-primary hover:underline"
      >
        <Mail className="h-3.5 w-3.5" />
        <span className="max-w-[180px] truncate">{email}</span>
      </a>
    )
  },

  link: ({ value }) => {
    const href = sanitizeUrl(value)
    if (!href) {
      return <span className="text-muted-foreground">{String(value)}</span>
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-primary hover:underline"
      >
        <span className="max-w-[180px] truncate">{href}</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    )
  },

  // "custom" without a render function just stringifies; callers supplying a
  // render function are handled earlier in renderCell.
  custom: ({ value }) => <span>{String(value)}</span>,
}

// Cell renderer dispatch. Resolves the caller's custom render first, handles
// null/undefined, then delegates to the registered renderer for the component.
export function renderCell<T extends Record<string, unknown>>(
  value: unknown,
  row: T,
  column: DynamicColumn<T>
): React.ReactNode {
  if (column.render) {
    return column.render(value, row)
  }

  if (value === null || value === undefined) {
    return (
      <span className="text-muted-foreground">{column.placeholder ?? "-"}</span>
    )
  }

  const renderer = renderers[column.component ?? "text"] ?? renderers.text
  return renderer({ value, row, column })
}
