"use client"

import type { ReactNode } from "react"

import { useIsMobile } from "@/hooks/use-mobile"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"

import type { DialogConfig } from "./types"

interface DynamicTableDialogProps extends DialogConfig {
  children: ReactNode
}

/**
 * Responsive dialog shell used by DynamicTable.
 * Renders a centered Dialog on desktop (≥ 1024 px) and a bottom Drawer on
 * mobile (< 1024 px).  The consumer is fully responsible for the body content
 * (forms, confirmations, etc.) — this component only provides the shell
 * (header + scrollable area).
 */
export function DynamicTableDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: DynamicTableDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-start">
            <DrawerTitle>{title}</DrawerTitle>
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
          <ScrollArea className="overflow-y-auto px-4 pb-4">
            {children}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <ScrollArea>{children}</ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
