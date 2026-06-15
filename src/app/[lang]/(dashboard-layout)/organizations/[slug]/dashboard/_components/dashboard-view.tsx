"use client"

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { DynamicTable } from "../../../../(design-system)/tables/_components/tables/dynamic-table"
import type { DynamicColumn } from "../../../../(design-system)/tables/_components/tables/dynamic-table/types"

const TABS = [
  { id: "info", label: "Info" },
  { id: "courses", label: "Courses" },
  { id: "users", label: "Users" },
  { id: "terms", label: "Terms" },
  { id: "lvls", label: "Levels" },
  { id: "roles", label: "Roles" },
  { id: "permissions", label: "Permissions" },
]

export function DashboardView({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const activeTab = searchParams.get("tab") || TABS[0].id

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Placeholder columns and data for the dynamic table
  const columns: DynamicColumn<any>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status", component: "badge" },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
      {/* Inner Sidebar Controller */}
      <aside className="w-full md:w-56 lg:w-64 shrink-0">
        <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "justify-start whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {activeTab === "info" ? (
          <Card>
            <CardHeader>
              <CardTitle>Organization Info</CardTitle>
              <CardDescription>
                Overview and settings for organization: <strong>{slug}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Additional organization info would go here */}
            </CardContent>
          </Card>
        ) : (
          <DynamicTable
            data={[]}
            columns={columns}
            title={`${TABS.find((t) => t.id === activeTab)?.label} List`}
            searchable
            searchColumn="name"
            searchPlaceholder={`Search ${activeTab}...`}
            noResultsMessage={`No ${activeTab} found.`}
          />
        )}
      </div>
    </div>
  )
}
