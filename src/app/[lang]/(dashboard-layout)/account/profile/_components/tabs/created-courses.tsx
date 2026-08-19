"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { courseService } from "@/app/[lang]/(dashboard-layout)/account/courses/_services/course-service"
import { useSession } from "next-auth/react"
import { Loader2, Plus, Trash2 } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"
import type { Course } from "@/types/api"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { typography } from "@/lib/typography"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DefaultImage } from "@/components/ui/defult-Image"

interface CreatedCoursesProps {
  dictionary: DictionaryType
}

export function CreatedCourses({ dictionary }: CreatedCoursesProps) {
  const params = useParams()
  const locale = params.lang as LocaleType
  const { data: session } = useSession()
  const t = dictionary.profilePage.createdCourses
  const tCreate = dictionary.profilePage.createCourse

  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Delete state
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchCourses() {
      if (!session?.user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const data = await courseService.getCoursesByInstructor(session.user.id)
        setCourses(data)
      } catch (err) {
        console.error("Failed to fetch created courses:", err)
        setError("Failed to load courses")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [session?.user?.id])

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return

    try {
      setIsDeleting(true)
      await courseService.deleteCourse(courseToDelete._id)

      // Remove from list
      setCourses((prev) => prev.filter((c) => c._id !== courseToDelete._id))
      setCourseToDelete(null)
    } catch (err) {
      console.error("Failed to delete course:", err)
      // Ideally show a toast here
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-6 text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={typography.h4}>
            {dictionary.profilePage.tabs.createdCourses}
          </h2>
          <p className={typography.muted}>
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </p>
        </div>
        <Button asChild>
          <Link
            href={ensureLocalizedPathname(
              "/account/courses/create",
              locale
            )}
          >
            <Plus className="size-4" />
            {tCreate.createNewCourse}
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">
            You haven't created any courses yet.
          </p>
          <Button asChild>
            <Link
              href={ensureLocalizedPathname(
                "/account/courses/create",
                locale
              )}
            >
              <Plus className="size-4" />
              {tCreate.createNewCourse}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {courses.map((course) => (
            <div key={course._id} className="relative group">
              <Card
                asChild
                className="overflow-hidden hover:shadow-md transition-shadow h-full"
              >
                <Link
                  href={ensureLocalizedPathname(
                    `/public/course/${course._id}`,
                    locale
                  )}
                >
                  <CardContent className="p-0">
                    <AspectRatio ratio={16 / 9} className="bg-muted">
                      <DefaultImage
                        src={course.thumbnailUrl}
                        alt={`Course thumbnail for ${course.title}`}
                        fill
                        className="object-cover"
                      />
                    </AspectRatio>
                  </CardContent>
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <Badge
                        variant={course.isPublished ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {course.isPublished ? t.published : t.draft}
                      </Badge>
                    </div>
                    <CardDescription>
                      {(course.students?.length || 0).toLocaleString()}{" "}
                      {t.students}
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 size-8 shadow-sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCourseToDelete(course)
                }}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Delete course</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!courseToDelete}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course "{courseToDelete?.title}" and remove all data associated
              with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteCourse()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
