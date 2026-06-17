// Sample data types for DynamicTable demo
export interface SampleUser {
  [key: string]: unknown
  id: string
  name: string
  email: string
  avatar: string
  role: string
  status: "Active" | "Inactive" | "Pending"
  salary: number
  percentage: number
  isVerified: boolean
  joinedAt: string
  document: string
}

// Sample data for demo
export const sampleUsers: SampleUser[] = [
  {
    id: "USR001",
    name: "Ahmed Hassan",
    email: "ahmed.hassan@example.com",
    avatar: "/images/avatars/avatar-01.jpg",
    role: "Developer",
    status: "Active",
    salary: 75000,
    percentage: 87.5,
    isVerified: true,
    joinedAt: "2024-01-15T10:30:00Z",
    document: "/files/resume-ahmed.pdf",
  },
  {
    id: "USR002",
    name: "Sara Mohamed",
    email: "sara.m@example.com",
    avatar: "/images/avatars/avatar-02.jpg",
    role: "Designer",
    status: "Active",
    salary: 65000,
    percentage: 92.3,
    isVerified: true,
    joinedAt: "2024-02-20T14:00:00Z",
    document: "/files/portfolio-sara.pdf",
  },
  {
    id: "USR003",
    name: "Omar Ali",
    email: "omar.ali@example.com",
    avatar: "/images/avatars/avatar-03.jpg",
    role: "Manager",
    status: "Pending",
    salary: 95000,
    percentage: 78.9,
    isVerified: false,
    joinedAt: "2024-03-10T09:15:00Z",
    document: "/files/cv-omar.pdf",
  },
  {
    id: "USR004",
    name: "Fatima Ahmed",
    email: "fatima.a@example.com",
    avatar: "/images/avatars/avatar-04.jpg",
    role: "Analyst",
    status: "Active",
    salary: 55000,
    percentage: 95.1,
    isVerified: true,
    joinedAt: "2024-04-05T11:45:00Z",
    document: "/files/report-fatima.pdf",
  },
  {
    id: "USR005",
    name: "Khaled Ibrahim",
    email: "khaled.i@example.com",
    avatar: "/images/avatars/avatar-05.jpg",
    role: "Developer",
    status: "Inactive",
    salary: 70000,
    percentage: 65.2,
    isVerified: false,
    joinedAt: "2023-11-28T16:20:00Z",
    document: "/files/docs-khaled.pdf",
  },
  {
    id: "USR006",
    name: "Nour Youssef",
    email: "nour.y@example.com",
    avatar: "/images/avatars/avatar-06.jpg",
    role: "Designer",
    status: "Active",
    salary: 62000,
    percentage: 88.7,
    isVerified: true,
    joinedAt: "2024-05-12T08:30:00Z",
    document: "/files/portfolio-nour.pdf",
  },
  {
    id: "USR007",
    name: "Youssef Mahmoud",
    email: "youssef.m@example.com",
    avatar: "/images/avatars/avatar-07.jpg",
    role: "Analyst",
    status: "Pending",
    salary: 58000,
    percentage: 72.4,
    isVerified: false,
    joinedAt: "2024-06-01T13:00:00Z",
    document: "/files/analysis-youssef.pdf",
  },
  {
    id: "USR008",
    name: "Layla Hassan",
    email: "layla.h@example.com",
    avatar: "/images/avatars/avatar-08.jpg",
    role: "Manager",
    status: "Active",
    salary: 92000,
    percentage: 91.8,
    isVerified: true,
    joinedAt: "2023-09-15T10:00:00Z",
    document: "/files/strategy-layla.pdf",
  },
]
