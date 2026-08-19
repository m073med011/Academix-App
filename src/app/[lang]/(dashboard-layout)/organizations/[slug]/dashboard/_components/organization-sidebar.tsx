"use client"

import { useMedia } from "react-use"
import { Card } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ComponentType } from "react"

export interface TabType {
  id: string
  label: string
  icon?: ComponentType<{ className?: string }>
}

interface OrganizationSidebarProps {
  tabs: TabType[]
  activeTab: string
  onTabChange: (tabId: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function OrganizationSidebar({
  tabs,
  activeTab,
  onTabChange,
  isOpen,
  setIsOpen,
}: OrganizationSidebarProps) {
  const isMediumOrSmaller = useMedia("(max-width: 767px)", false)

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId)
    if (isMediumOrSmaller) {
      setIsOpen(false)
    }
  }

  const content = (
    <ul className="p-3 pt-3">
      <nav className="space-y-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <li key={tab.id}>
              <Button
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "w-full justify-start whitespace-nowrap font-normal",
                  activeTab === tab.id
                    ? "bg-accent font-medium"
                    : "text-muted-foreground"
                )}
              >
                {Icon && <Icon className="me-2 h-4 w-4" />}
                <span className="capitalize">{tab.label}</span>
              </Button>
            </li>
          )
        })}
      </nav>
    </ul>
  )

  if (!isMediumOrSmaller) {
    return (
      <aside className="shrink-0">
        <Card className="h-full w-72 flex flex-col border border-border">
          {content}
        </Card>
      </aside>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="start" className="p-0 w-72">
        <SheetHeader className="sr-only">
          <SheetTitle>Organization Sidebar</SheetTitle>
          <SheetDescription>
            Navigate organization sections.
          </SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  )
}
