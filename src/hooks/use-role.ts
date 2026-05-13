import { useSession } from "next-auth/react"

import type { UserRole } from "@/types/api"

/**
 * Returns the current user's role from the NextAuth session,
 * plus a dynamic `isRole()` checker.
 *
 * @example
 * ```tsx
 * const { role, isRole, isLoading } = useRole()
 *
 * // Single role check
 * isRole("organizer")              // true | false
 *
 * // Multiple roles — true if user matches ANY of them
 * isRole("organizer", "admin")     // true | false
 *
 * // Usage in JSX
 * {isRole("organizer") && <CreateOrganizationButton />}
 * {isRole("admin", "instructor") && <ManageCoursesButton />}
 * ```
 */
export function useRole() {
  const { data: session, status } = useSession()

  const role = (session?.user?.role ?? null) as UserRole | null

  /**
   * Returns `true` if the current user's role matches
   * **any** of the provided roles.
   *
   * @param roles - One or more `UserRole` values to check against.
   */
  const isRole = (...roles: UserRole[]): boolean => {
    if (!role) return false
    return roles.includes(role)
  }

  return {
    role,
    isRole,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}
