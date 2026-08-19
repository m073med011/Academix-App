import { notFound } from "next/navigation"
import { createServerCourseService } from "@/app/[lang]/(dashboard-layout)/account/courses/_services/course-service"

import type { LocaleType } from "@/types"

import { getDictionary } from "@/lib/get-dictionary"

import { CourseDetailsView } from "./course-details-view"

export default async function CourseDetailsPage(props: {
  params: Promise<{ lang: LocaleType; id: string }>
}) {
  const params = await props.params
  const dictionary = await getDictionary(params.lang)

  // Fetch course details server-side
  const serverCourseService = createServerCourseService()

  try {
    const course = await serverCourseService.getCourse(params.id)

    if (!course) {
      notFound()
    }

    return (
      <CourseDetailsView
        dictionary={dictionary}
        course={course}
        courseId={params.id}
      />
    )
  } catch (error) {
    console.error("Failed to fetch course:", error)
    notFound()
  }
}
