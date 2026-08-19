import { createServerCourseService } from "@/app/[lang]/(dashboard-layout)/account/courses/_services/course-service"

import type { LocaleType } from "@/types"

import { getDictionary } from "@/lib/get-dictionary"

import { StoreView } from "./store-view"

export default async function StorePage(props: {
  params: Promise<{ lang: LocaleType }>
  searchParams: Promise<{
    page?: string
    category?: string
    level?: string
    search?: string
    sort?: string
  }>
}) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ])

  const dictionary = await getDictionary(params.lang)

  // Parse search params
  const page = Number(searchParams.page) || 1
  const limit = 12
  const category = searchParams.category
  const level = searchParams.level
  const search = searchParams.search
  const sort = searchParams.sort

  // Fetch initial courses server-side
  const serverCourseService = createServerCourseService()

  try {
    const response = await serverCourseService.getCourses({
      page,
      limit,
      category,
      level,
      search,
      sort,
    })

    const initialCourses = response.data || []
    const initialPagination = response.pagination || {
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasMore: false,
    }

    return (
      <StoreView
        dictionary={dictionary}
        initialCourses={initialCourses}
        initialPagination={initialPagination}
      />
    )
  } catch (error) {
    console.error("Failed to fetch courses:", error)

    // Return with empty data on error
    return (
      <StoreView
        dictionary={dictionary}
        initialCourses={[]}
        initialPagination={{
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        }}
      />
    )
  }
}
