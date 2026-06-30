"use client"

import { useEffect, useState } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { Plus, Users, BookOpen, Calendar, Layers, MapPin, Menu, Info, Shield, ShieldAlert, Pencil, Trash } from "lucide-react"
import { toast } from "sonner"

import { DynamicTable } from "../../../../(design-system)/tables/_components"
import type { DynamicColumn } from "../../../../(design-system)/tables/_components/types"
import { courseService } from "../../../../account/courses/_services/course-service"
import { organizationService } from "../../../_services/organization.service"
import type { Course, Organization } from "@/types/api"
import { OrganizationSidebar } from "./organization-sidebar"
import { CreateRoleModal } from "./create-role-modal"
import { EditRoleModal } from "./edit-role-modal"
import { LevelsTab } from "./levels-tab"
import { TermsTab } from "./terms-tab"
import { UsersTab } from "./users-tab"
import { EditOrganizationModal } from "./edit-organization-modal"
import { EditCourseModal } from "./edit-course-modal"

const TABS = [
  { id: "info", label: "Info", icon: Info },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "users", label: "Users", icon: Users },
  { id: "terms", label: "Terms", icon: Calendar },
  { id: "lvls", label: "Levels", icon: Layers },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "permissions", label: "Permissions", icon: ShieldAlert },
]

export function DashboardView({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const activeTab = searchParams.get("tab") || TABS[0].id

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loadingOrg, setLoadingOrg] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  const [roles, setRoles] = useState<any[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false)

  const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState(false)

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false)

  const refreshCourses = async () => {
    setLoadingCourses(true)
    try {
      const res = await courseService.getCourses({ organizationId: slug })
      const coursesData = Array.isArray(res) ? res : res.data || []
      setCourses(coursesData as any)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingCourses(false)
    }
  }

  const fetchRoles = async () => {
    setLoadingRoles(true)
    try {
      const res: any = await organizationService.getRoles(slug)
      const rolesData = Array.isArray(res) ? res : res.data || []
      setRoles(rolesData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingRoles(false)
    }
  }

  useEffect(() => {
    if (activeTab === "roles") {
      fetchRoles()
    }
  }, [activeTab, slug])

  useEffect(() => {
    setLoadingOrg(true)
    organizationService
      .getOrganizationById(slug)
      .then((res: any) => {
        // API response might have wrapped it in an array or .data, as reported
        const orgData = Array.isArray(res.data) ? res.data[0] : res.data || res
        setOrganization(orgData)
      })
      .catch(console.error)
      .finally(() => setLoadingOrg(false))
  }, [slug])

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

  const handleDeleteCourses = async (selectedRows: any[]) => {
    try {
      const ids = selectedRows.map((row) => row._id || row.id)
      await courseService.deleteCourses(ids)
      toast.success(`${ids.length} course(s) deleted successfully.`)
      
      // Refresh courses
      setLoadingCourses(true)
      const res = await courseService.getCourses({ organizationId: slug })
      const coursesData = Array.isArray(res) ? res : res.data || []
      setCourses(coursesData as any)
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete selected courses.")
    } finally {
      setLoadingCourses(false)
    }
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

  const rolesColumns: DynamicColumn<any>[] = [
    { key: "name", label: "Name" },
  ]

  const tableColumns = activeTab === "courses" ? coursesColumns : activeTab === "roles" ? rolesColumns : defaultColumns
  const tableData = activeTab === "courses" ? courses : activeTab === "roles" ? roles : []
  const tableSearchColumn = activeTab === "courses" ? "title" : "name"
  const isLoading = activeTab === "courses" ? loadingCourses : activeTab === "roles" ? loadingRoles : false

  const createCourseButton = {
    label: "Add new course",
    icon: Plus,
    onClick: () => {
      const lang = pathname.split("/")[1]
      router.push(
        `/${lang}/account/courses/create?organizationId=${slug}&courseType=organization`
      )
    },
  }

  const createRoleButton = {
    label: "Create Role",
    icon: Plus,
    onClick: () => setIsCreateRoleModalOpen(true),
  }

  const createButton = activeTab === "courses" ? createCourseButton : activeTab === "roles" ? createRoleButton : undefined

  const handleDeleteRole = async (role: any) => {
    if (!window.confirm(`Are you sure you want to delete role "${role.name}"?`)) return
    try {
      setLoadingRoles(true)
      await organizationService.deleteRole(slug, role._id || role.id)
      toast.success("Role deleted successfully.")
      fetchRoles()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete role.")
      setLoadingRoles(false)
    }
  }

  const roleActions = [
    {
      label: "Edit",
      icon: Pencil,
      onClick: (row: any) => {
        setSelectedRole(row)
        setIsEditRoleModalOpen(true)
      },
    },
    {
      label: "Delete",
      icon: Trash,
      variant: "destructive" as const,
      onClick: handleDeleteRole,
    },
  ]

  const courseActions = [
    {
      label: "Edit",
      icon: Pencil,
      onClick: (row: any) => {
        setSelectedCourse(row)
        setIsEditCourseModalOpen(true)
      },
    },
  ]

  const tableActions = activeTab === "roles" ? roleActions : activeTab === "courses" ? courseActions : undefined

  return (
    <div className="flex gap-4 lg:gap-6 h-full">
      <OrganizationSidebar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">{TABS.find((t) => t.id === activeTab)?.label}</span>
        </div> */}

        {activeTab === "info" ? (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle>Organization Info</CardTitle>
                <CardDescription>
                  Overview and settings for organization: <strong>{slug}</strong>
                </CardDescription>
              </div>
              {organization && (
                <Button variant="outline" size="sm" onClick={() => setIsEditOrgModalOpen(true)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loadingOrg ? (
                <div className="flex justify-center py-8 text-muted-foreground animate-pulse">Loading organization details...</div>
              ) : organization ? (
                <div className="space-y-8">
                  {/* Header / Profile section */}
                  <div className="flex items-center gap-6">
                    {organization.orgcover ? (
                      <img 
                        src={organization.orgcover} 
                        alt={organization.name} 
                        className="w-24 h-24 rounded-lg object-cover shadow-sm border"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary border shadow-sm">
                        {organization.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <h3 className="text-2xl font-bold tracking-tight">{organization.name}</h3>
                      {organization.description && (
                        <p className="text-muted-foreground max-w-xl">{organization.description}</p>
                      )}
                      {organization.owner && (
                        <div className="flex items-center gap-2 mt-2 pt-2 text-sm text-muted-foreground border-t">
                          {(organization.owner as any).imageProfileUrl ? (
                            <img src={(organization.owner as any).imageProfileUrl} alt={(organization.owner as any).name} className="w-5 h-5 rounded-full" />
                          ) : null}
                          <span>Owned by <strong>{(organization.owner as any).name || "Unknown"}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="shadow-none border bg-muted/20">
                      <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Students</p>
                          <p className="text-2xl font-bold">{organization.studentsCount ?? 0}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-none border bg-muted/20">
                      <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Courses</p>
                          <p className="text-2xl font-bold">{organization.coursesCount ?? 0}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-none border bg-muted/20">
                      <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Terms</p>
                          <p className="text-2xl font-bold">{organization.termsCount ?? 0}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-none border bg-muted/20">
                      <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2">
                        <Layers className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Levels</p>
                          <p className="text-2xl font-bold">{organization.levelsCount ?? 0}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Settings section */}
                  {organization.settings && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider mb-4">Organization Settings</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <span className="text-muted-foreground">Multiple Levels</span>
                          <span className={cn("font-medium", organization.settings.allowMultipleLevels ? "text-green-600" : "text-muted-foreground")}>
                            {organization.settings.allowMultipleLevels ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <span className="text-muted-foreground">Term Assignment</span>
                          <span className={cn("font-medium", organization.settings.requireTermAssignment ? "text-green-600" : "text-muted-foreground")}>
                            {organization.settings.requireTermAssignment ? "Required" : "Optional"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <span className="text-muted-foreground">Student Self-Enroll</span>
                          <span className={cn("font-medium", organization.settings.allowStudentSelfEnroll ? "text-green-600" : "text-muted-foreground")}>
                            {organization.settings.allowStudentSelfEnroll ? "Allowed" : "Restricted"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Organization data could not be loaded.
                </div>
              )}
            </CardContent>
          </Card>
        ) : activeTab === "lvls" ? (
          <LevelsTab organizationId={slug} />
        ) : activeTab === "terms" ? (
          <TermsTab organizationId={slug} />
        ) : activeTab === "users" ? (
          <UsersTab organizationId={slug} />
        ) : (
          <DynamicTable
            data={tableData}
            columns={tableColumns}
            title={`${TABS.find((t) => t.id === activeTab)?.label} List`}
            searchable
            searchColumn={tableSearchColumn}
            searchPlaceholder={`Search ${activeTab}...`}
            noResultsMessage={`No ${activeTab} found.`}
            createButton={createButton}
            actions={tableActions}
            isLoading={isLoading}
            showCheckbox={activeTab === "courses"}
            onDeleteSelected={activeTab === "courses" ? handleDeleteCourses : undefined}
          />
        )}

        <CreateRoleModal
          organizationId={slug}
          isOpen={isCreateRoleModalOpen}
          onClose={() => setIsCreateRoleModalOpen(false)}
          onSuccess={fetchRoles}
        />

        <EditRoleModal
          organizationId={slug}
          role={selectedRole}
          isOpen={isEditRoleModalOpen}
          onClose={() => {
            setIsEditRoleModalOpen(false)
            setSelectedRole(null)
          }}
          onSuccess={fetchRoles}
        />

        <EditOrganizationModal
          organization={organization}
          isOpen={isEditOrgModalOpen}
          onClose={() => setIsEditOrgModalOpen(false)}
          onSuccess={(updated) => setOrganization(updated)}
        />

        <EditCourseModal
          course={selectedCourse}
          isOpen={isEditCourseModalOpen}
          onClose={() => {
            setIsEditCourseModalOpen(false)
            setSelectedCourse(null)
          }}
          onSuccess={refreshCourses}
        />
      </div>
    </div>
  )
}
