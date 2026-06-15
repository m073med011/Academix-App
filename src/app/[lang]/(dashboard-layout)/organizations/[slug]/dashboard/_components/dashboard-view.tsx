"use client"

import { useEffect, useState } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { Plus } from "lucide-react"

import { DynamicTable } from "../../../../(design-system)/tables/_components/tables/dynamic-table"
import type { DynamicColumn } from "../../../../(design-system)/tables/_components/tables/dynamic-table/types"
import { courseService } from "../../../../account/courses/_services/course-service"
import type { Course } from "@/types/api"

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

  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  useEffect(() => {
    if (activeTab === "courses") {
      setLoadingCourses(true)
      courseService
        .getCourses({ organizationId: slug })
        .then((res) => {
          // The API response might be { data: [...] } or the array itself depending on backend mapping
          const coursesData = Array.isArray(res) ? res : res.data || []
          setCourses(coursesData as any)
        })
        .catch(console.error)
        .finally(() => setLoadingCourses(false))
    }
  }, [activeTab, slug])

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Placeholder columns and data for the dynamic table
  const defaultColumns: DynamicColumn<any>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status", component: "badge" },
  ]

  const coursesColumns: DynamicColumn<any>[] = [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "level", label: "Level", component: "badge" },
    { 
      key: "isPublished", 
      label: "Status", 
      component: "badge", 
      render: (val) => (val ? "Published" : "Draft") 
    },
  ]

  const tableColumns = activeTab === "courses" ? coursesColumns : defaultColumns
  const tableData = activeTab === "courses" ? courses : []
  const tableSearchColumn = activeTab === "courses" ? "title" : "name"
  const isLoading = activeTab === "courses" ? loadingCourses : false

  const createCourseButton =
    activeTab === "courses"
      ? {
          label: "Add new course",
          icon: Plus,
          onClick: () => {
            const lang = pathname.split("/")[1]
            router.push(
              `/${lang}/account/courses/create?organizationId=${slug}&courseType=organization`
            )
          },
        }
      : undefined

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
            data={tableData}
            columns={tableColumns}
            title={`${TABS.find((t) => t.id === activeTab)?.label} List`}
            searchable
            searchColumn={tableSearchColumn}
            searchPlaceholder={`Search ${activeTab}...`}
            noResultsMessage={`No ${activeTab} found.`}
            createButton={createCourseButton}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}
