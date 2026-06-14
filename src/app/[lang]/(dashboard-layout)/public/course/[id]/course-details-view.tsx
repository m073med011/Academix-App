"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useCartStore } from "@/stores/cart-store"
import { usePurchasedCoursesStore } from "@/stores/purchased-courses-store"
import { useSession } from "next-auth/react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"
import type { Course } from "@/types/api"

import {
  CourseBreadcrumb,
  CourseHeader,
  CoursePurchaseCard,
  CourseTabs,
} from "./_components"

interface CourseDetailsViewProps {
  dictionary: DictionaryType
  course: Course
  courseId: string
}

export function CourseDetailsView({
  dictionary,
  course,
  courseId: _courseId,
}: CourseDetailsViewProps) {
  const params = useParams()
  const locale = params.lang as LocaleType
  const { data: session } = useSession()

  // Initialize stores
  const initializeCart = useCartStore((state) => state.initializeCart)
  const initializePurchasedCourses = usePurchasedCoursesStore(
    (state) => state.initializePurchasedCourses
  )
  const purchasedCourses = usePurchasedCoursesStore((state) => state.courses)

  const [isLoadingStores, setIsLoadingStores] = useState(true)

  // Initialize stores on mount
  useEffect(() => {
    const initStores = async () => {
      try {
        if (session) {
          await Promise.all([initializeCart(), initializePurchasedCourses()])
        }
      } catch (error) {
        console.error("Failed to initialize stores:", error)
      } finally {
        setIsLoadingStores(false)
      }
    }
    initStores()
  }, [session, initializeCart, initializePurchasedCourses])

  // Check if user has access to full course content
  const isOwner =
    (session?.user as any)?.id ===
    (typeof course.instructor === "string"
      ? course.instructor
      : course.instructor?._id)

  const isPurchased = purchasedCourses.some((c) => c._id === course._id)

  const hasAccess = isOwner || isPurchased

  return (
    <div className="min-h-screen bg-background">

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-8">
            <CourseHeader dictionary={dictionary} course={course} />
            <CourseTabs dictionary={dictionary} course={course} hasAccess={hasAccess} />
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <CoursePurchaseCard
              dictionary={dictionary}
              locale={locale}
              course={course}
              isLoadingStores={isLoadingStores}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
