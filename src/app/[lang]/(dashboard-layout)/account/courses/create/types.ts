export interface CourseFormData {
  // Basic Info
  title: string
  description: string
  category: string
  level: "beginner" | "intermediate" | "advanced" | "expert"
  duration: number

  // Curriculum
  modules: CourseModule[]

  // Pricing
  enrollmentType: "free" | "subscription" | "one-time-purchase"
  price: number
  currency: string
  isPrivate: boolean
  hasEnrollmentCap: boolean
  maxStudents: number
  enrollmentStartDate?: string
  enrollmentEndDate?: string

  // Media
  thumbnailUrl?: string
  promoVideoUrl?: string
  brandColor: string
}

export interface CourseModule {
  id: string
  title: string
  isExpanded: boolean
  contents: CourseContent[]
}

export interface CourseContent {
  id: string
  type: "video" | "text" | "quiz" | "assignment" | "link" // Changed article to text
  title: string
  status: "published" | "draft"
  // Video fields
  url?: string
  isFreePreview?: boolean
  allowDownloads?: boolean
  // Article/Text fields
  content?: string
  duration?: number // read time in minutes
  thumbnailUrl?: string // Added
  // Assignment fields
  description?: string
  points?: number
  dueDate?: string
  submissionTypes?: string[]
  allowLate?: boolean
  assignmentFileUrl?: string // Added
  // Quiz fields
  quizQuestions?: { // Added
    text: string
    options: string[]
    correctAnswer: string
  }[]
  // Link fields
  openInNewTab?: boolean
  // Legacy fields
  questions?: number
}

export type WizardStep = 1 | 2 | 3 | 4 | 5

export const WIZARD_STEPS = {
  BASIC_INFO: 1,
  CURRICULUM: 2,
  PRICING: 3,
  MEDIA: 4,
  REVIEW: 5,
} as const

export const initialCourseFormData: CourseFormData = {
  title: "",
  description: "",
  category: "",
  level: "beginner",
  duration: 0,
  modules: [],
  enrollmentType: "one-time-purchase",
  price: 0,
  currency: "USD",
  isPrivate: false,
  hasEnrollmentCap: false,
  maxStudents: 100,
  thumbnailUrl: undefined,
  promoVideoUrl: undefined,
  brandColor: "#137fec",
}
