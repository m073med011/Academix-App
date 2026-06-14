"use client"

import { useState } from "react"

import type { CourseFilterParams } from "@/types/api"

interface UseCoursesResult {
  filters: CourseFilterParams
  setFilters: (filters: CourseFilterParams) => void
}

/**
 * Custom hook for managing course filter state
 * NO CLIENT-SIDE FETCHING - All data comes from server-side rendering
 * This hook only manages UI filter state
 *
 * @param initialFilters - Initial filter parameters from URL
 */
export function useCourses(
  initialFilters: CourseFilterParams = {}
): UseCoursesResult {
  const [filters, setFilters] = useState<CourseFilterParams>(initialFilters)

  return {
    filters,
    setFilters,
  }
}
