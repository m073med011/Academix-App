"use client"

import { toast } from "sonner"
import { Archive, Eye, Pencil } from "lucide-react"

import type {
  ActionItem,
  BadgeVariant,
  DynamicColumn,
} from "@/app/[lang]/(dashboard-layout)/(design-system)/tables/_components/tables/dynamic-table/types"
import { DynamicTable } from "@/app/[lang]/(dashboard-layout)/(design-system)/tables/_components/tables/dynamic-table"

// Course type for organization courses
interface OrganizationCourse {
  id: string
  courseName: string
  status: "Active" | "Pending" | "Archived"
  enrollees: number
  createdDate: string
  [key: string]: any   
}

// Sample data matching the mockup
const sampleCourses: OrganizationCourse[] = [
  {
    id: "1",
    courseName: "Advanced JavaScript",
    status: "Active",
    enrollees: 124,
    createdDate: "2023-10-26",
  },
  {
    id: "2",
    courseName: "UI/UX Design Fundamentals",
    status: "Active",
    enrollees: 350,
    createdDate: "2023-09-15",
  },
  {
    id: "3",
    courseName: "Introduction to Python",
    status: "Pending",
    enrollees: 88,
    createdDate: "2023-08-01",
  },
  {
    id: "4",
    courseName: "Digital Marketing 101",
    status: "Archived",
    enrollees: 540,
    createdDate: "2022-11-20",
  },
  {
    id: "5",
    courseName: "Project Management Pro",
    status: "Active",
    enrollees: 215,
    createdDate: "2023-11-05",
  },
  {
    id: "6",
    courseName: "React Native Development",
    status: "Active",
    enrollees: 167,
    createdDate: "2023-07-12",
  },
  {
    id: "7",
    courseName: "Data Science Fundamentals",
    status: "Pending",
    enrollees: 92,
    createdDate: "2023-06-18",
  },
  {
    id: "8",
    courseName: "Cloud Computing Basics",
    status: "Active",
    enrollees: 203,
    createdDate: "2023-05-22",
  },
  {
    id: "9",
    courseName: "Cybersecurity Essentials",
    status: "Active",
    enrollees: 156,
    createdDate: "2023-04-10",
  },
  {
    id: "10",
    courseName: "Mobile App Design",
    status: "Archived",
    enrollees: 98,
    createdDate: "2022-12-05",
  },
  {
    id: "11",
    courseName: "Machine Learning Intro",
    status: "Active",
    enrollees: 134,
    createdDate: "2023-03-15",
  },
  {
    id: "12",
    courseName: "Blockchain Development",
    status: "Pending",
    enrollees: 76,
    createdDate: "2023-02-28",
  },
  {
    id: "13",
    courseName: "Full Stack Web Development",
    status: "Active",
    enrollees: 289,
    createdDate: "2023-01-20",
  },
  {
    id: "14",
    courseName: "DevOps Engineering",
    status: "Active",
    enrollees: 145,
    createdDate: "2022-12-30",
  },
  {
    id: "15",
    courseName: "Graphic Design Mastery",
    status: "Active",
    enrollees: 198,
    createdDate: "2022-11-15",
  },
  {
    id: "16",
    courseName: "SQL Database Management",
    status: "Archived",
    enrollees: 312,
    createdDate: "2022-10-08",
  },
  {
    id: "17",
    courseName: "Content Marketing Strategy",
    status: "Active",
    enrollees: 176,
    createdDate: "2023-09-25",
  },
  {
    id: "18",
    courseName: "iOS Development Swift",
    status: "Pending",
    enrollees: 64,
    createdDate: "2023-08-12",
  },
  {
    id: "19",
    courseName: "Angular Framework",
    status: "Active",
    enrollees: 112,
    createdDate: "2023-07-30",
  },
  {
    id: "20",
    courseName: "WordPress Development",
    status: "Active",
    enrollees: 223,
    createdDate: "2023-06-05",
  },
  {
    id: "21",
    courseName: "Game Development Unity",
    status: "Pending",
    enrollees: 85,
    createdDate: "2023-05-18",
  },
  {
    id: "22",
    courseName: "SEO Optimization",
    status: "Active",
    enrollees: 267,
    createdDate: "2023-04-22",
  },
  {
    id: "23",
    courseName: "AI for Beginners",
    status: "Active",
    enrollees: 189,
    createdDate: "2023-03-08",
  },
  {
    id: "24",
    courseName: "Network Security",
    status: "Archived",
    enrollees: 143,
    createdDate: "2022-09-14",
  },
]

interface CoursesTabProps {
  dictionary: {
    searchPlaceholder: string
    columns: {
      courseName: string
      status: string
      enrollees: string
      createdDate: string
      actions: string
    }
    actions: {
      view: string
      edit: string
      archive: string
    }
    title: string // tabs.courses
  }
}

export function CoursesTab({ dictionary }: CoursesTabProps) {
  // Column configuration
  const courseColumns: DynamicColumn<OrganizationCourse>[] = [
    {
      key: "courseName",
      label: dictionary.columns.courseName,
      component: "text",
      sortable: true,
    },
    {
      key: "status",
      label: dictionary.columns.status,
      component: "badge",
      sortable: true,
      getBadgeVariant: (value): BadgeVariant => {
        switch (value) {
          case "Active":
            return "success"
          case "Pending":
            return "warning"
          case "Archived":
            return "destructive"
          default:
            return "default"
        }
      },
    },
    {
      key: "enrollees",
      label: dictionary.columns.enrollees,
      component: "number",
      sortable: true,
    },
    {
      key: "createdDate",
      label: dictionary.columns.createdDate,
      component: "date",
      sortable: true,
    },
  ]

  // Action handlers
  const handleView = (course: OrganizationCourse) => {
    toast.info(`Viewing: ${course.courseName}`)
  }

  const handleEdit = (course: OrganizationCourse) => {
    toast.info(`Editing: ${course.courseName}`)
  }

  const handleArchive = (course: OrganizationCourse) => {
    toast.warning(`Archiving: ${course.courseName}`)
  }

  // Actions configuration
  const courseActions: ActionItem<OrganizationCourse>[] = [
    {
      label: dictionary.actions.view,
      icon: Eye,
      onClick: handleView,
    },
    {
      label: dictionary.actions.edit,
      icon: Pencil,
      onClick: handleEdit,
    },
    {
      label: dictionary.actions.archive,
      icon: Archive,
      onClick: handleArchive,
      variant: "destructive",
      separator: true,
    },
  ]

  return (
    <DynamicTable<OrganizationCourse>
      data={sampleCourses}
      columns={courseColumns}
      actions={courseActions}
      showCheckbox={true}
      searchColumn="courseName"
      searchPlaceholder={dictionary.searchPlaceholder}
      defaultView="table"
      title={dictionary.title}
      cardGridCols={3}
      defaultPageSize={10}
    />
  )
}
