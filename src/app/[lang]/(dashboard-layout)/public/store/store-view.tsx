"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { Course, CourseFilterParams, CoursePagination } from "@/types/api"

import { useCourses } from "@/app/[lang]/(dashboard-layout)/account/courses/_hooks/use-courses"
import { StoreFilters } from "./_components/store-filters"
import { StoreHero } from "./_components/store-hero"
import { StoreList } from "./_components/store-list"

interface StoreViewProps {
  dictionary: DictionaryType
  initialCourses: Course[]
  initialPagination: CoursePagination
}

export function StoreView({
  dictionary,
  initialCourses,
  initialPagination,
}: StoreViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Initialize filters from URL search params
  const initialFilters: CourseFilterParams = {
    page: Number(searchParams.get("page")) || 1,
    limit: 12,
    category: searchParams.get("category") || undefined,
    level:
      (searchParams.get("level") as CourseFilterParams["level"]) || undefined,
    search: searchParams.get("search") || undefined,
    sort: searchParams.get("sort") || undefined,
  }

  // Use the hook for filter state management only
  // Courses and pagination come directly from server-side props
  const { filters, setFilters } = useCourses(initialFilters)

  /**
   * Update URL and trigger server-side navigation
   * This causes the page to re-render on the server with new data
   */
  const updateURL = (newFilters: CourseFilterParams) => {
    const params = new URLSearchParams()

    if (newFilters.page && newFilters.page > 1) {
      params.set("page", newFilters.page.toString())
    }
    if (newFilters.category) params.set("category", newFilters.category)
    if (newFilters.level) params.set("level", newFilters.level)
    if (newFilters.search) params.set("search", newFilters.search)
    if (newFilters.sort) params.set("sort", newFilters.sort)

    const queryString = params.toString()
    const newURL = queryString ? `?${queryString}` : ""

    // Navigate to new URL - this triggers server-side re-render
    router.push(`${pathname}${newURL}`)
  }

  const handleFilterChange = (newFilters: Partial<CourseFilterParams>) => {
    // Merge filters and remove undefined values
    const merged = { ...filters, ...newFilters, page: 1 }

    // Remove undefined properties to ensure clean filter state
    const updatedFilters: CourseFilterParams = {
      page: merged.page,
      limit: merged.limit,
      ...(merged.category && { category: merged.category }),
      ...(merged.level && { level: merged.level }),
      ...(merged.search && { search: merged.search }),
      ...(merged.sort && { sort: merged.sort }),
    }

    setFilters(updatedFilters)
    updateURL(updatedFilters)
  }

  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page }
    setFilters(updatedFilters)
    updateURL(updatedFilters)
  }

  const handleSortChange = (sortValue: string) => {
    const updatedFilters = { ...filters, sort: sortValue, page: 1 }
    setFilters(updatedFilters)
    updateURL(updatedFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters = { page: 1, limit: 12 }
    setFilters(clearedFilters)
    updateURL(clearedFilters)
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <StoreHero dictionary={dictionary} />

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <StoreFilters
            dictionary={dictionary}
            isOpen={isFilterOpen}
            setIsOpen={setIsFilterOpen}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            currentFilters={filters}
          />
          <StoreList
            dictionary={dictionary}
            courses={initialCourses}
            pagination={initialPagination}
            loading={false}
            error={null}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            currentSort={filters.sort}
          />
        </div>
      </div>
    </div>
  )
}
