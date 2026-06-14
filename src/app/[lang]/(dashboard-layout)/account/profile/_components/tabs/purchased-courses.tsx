"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePurchasedCoursesStore } from "@/stores/purchased-courses-store"
import { Loader2, Star } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { ensureLocalizedPathname } from "@/lib/i18n"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PurchasedCoursesProps {
  dictionary: DictionaryType
  locale: LocaleType
}

export function PurchasedCourses({ dictionary, locale }: PurchasedCoursesProps) {
  const t = dictionary.profilePage.purchasedCourses
  const { courses, isLoading, initializePurchasedCourses } =
    usePurchasedCoursesStore()

  useEffect(() => {
    initializePurchasedCourses()
  }, [initializePurchasedCourses])

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
          <CardTitle className="text-lg mb-2">{t.noCoursesTitle}</CardTitle>
          <CardDescription className="mb-6">
            {t.noCoursesDescription}
          </CardDescription>
          <Button asChild>
            <Link href={ensureLocalizedPathname("/public/store", locale)}>{t.browseCourses}</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        {courses.map((course) => (
          <Card
            key={course._id}
            asChild
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <Link href={ensureLocalizedPathname(`/public/course/${course._id}`, locale)}>
              <CardContent className="p-0">
                <AspectRatio ratio={16 / 9} className="bg-muted">
                  <Image
                    src={course.thumbnailUrl || "/placeholder-course.jpg"}
                    alt={`Course thumbnail for ${course.title}`}
                    fill
                    className="object-cover"
                  />
                </AspectRatio>
              </CardContent>
              <CardHeader className="p-4">
                <CardTitle className="text-base line-clamp-2">
                  {course.title}
                </CardTitle>
                <CardDescription>
                  {course.level} • {course.duration} {t.hours}
                </CardDescription>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="size-3 fill-yellow-500 text-yellow-500" />
                    <span>{course.rating?.toFixed(1) || "0.0"}</span>
                  </Badge>
                  <Badge variant="secondary">
                    {course.students?.length || 0} {t.students}
                  </Badge>
                </div>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
