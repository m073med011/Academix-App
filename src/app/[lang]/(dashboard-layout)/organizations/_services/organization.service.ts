import { CreateOrganizationRequest } from "../../../../../types/Org_types/types"
import { Organization, OrganizationMembership, User } from "@/types/api"

import { apiClient } from "@/lib/api-client"

// ============================================
// Levels
// ============================================
export interface Level {
  _id: string
  name: string
  description?: string
  organizationId: string
  order?: number
  terms?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateLevelRequest {
  name: string
  description?: string
  organizationId: string
  order?: number
}

export type UpdateLevelRequest = Partial<Omit<CreateLevelRequest, "organizationId">>

// ============================================
// Terms
// ============================================
export interface Term {
  _id: string
  name: string
  description?: string
  levelId: string
  organizationId: string
  startDate: string
  endDate: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateTermRequest {
  name: string
  description?: string
  startDate: string
  endDate: string
}

export type UpdateTermRequest = Partial<CreateTermRequest>

// ============================================
// Members
// ============================================
export interface AddMemberRequest {
  userId: string
  email: string
  roleId: string
  levelId?: string
  termId?: string
}

export interface UpdateMemberRoleRequest {
  roleId: string
  levelId?: string
  termId?: string
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface GetMembersParams {
  page?: number
  limit?: number
  status?: "active" | "inactive" | "invited" | "left"
  roleId?: string
  levelId?: string
  termId?: string
}

function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value))
    }
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}

export const organizationService = {
  // ============================================
  // Organization core
  // ============================================
  getUserOrganizations: async () => {
    return apiClient.get<OrganizationMembership[]>("/users/organizations")
  },

  createOrganization: async (data: CreateOrganizationRequest) => {
    return apiClient.post("/organizations", data)
  },

  getOrganizationById: async (id: string) => {
    return apiClient.get<Organization>(`/organizations/${id}`)
  },

  updateOrganization: async (
    id: string,
    data: {
      name?: string
      description?: string
      orgcover?: string
      settings?: Record<string, unknown>
    }
  ) => {
    return apiClient.patch<Organization>(`/organizations/${id}`, data)
  },

  deleteOrganizations: async (ids: string[]) => {
    return apiClient.delete<{ successful: string[]; failed: { id: string; reason: string }[] }>(
      "/organizations",
      { body: JSON.stringify({ ids }) }
    )
  },

  // ============================================
  // Roles
  // ============================================
  getRoles: async (organizationId: string) => {
    return apiClient.get(`/organizations/${organizationId}/roles`)
  },

  createRole: async (organizationId: string, data: { name: string; permissions?: any }) => {
    return apiClient.post(`/organizations/${organizationId}/roles`, data)
  },

  updateRole: async (organizationId: string, roleId: string, data: { name?: string; permissions?: any }) => {
    return apiClient.patch(`/organizations/${organizationId}/roles/${roleId}`, data)
  },

  deleteRole: async (organizationId: string, roleId: string) => {
    return apiClient.delete(`/organizations/${organizationId}/roles/${roleId}`)
  },

  // ============================================
  // Levels  (backend: /levels)
  // ============================================
  getLevels: async (organizationId: string) => {
    return apiClient.get<Level[]>(`/levels/organization/${organizationId}`)
  },

  getLevel: async (levelId: string) => {
    return apiClient.get<Level>(`/levels/${levelId}`)
  },

  createLevel: async (data: CreateLevelRequest) => {
    return apiClient.post<Level>("/levels", data)
  },

  updateLevel: async (levelId: string, data: UpdateLevelRequest) => {
    return apiClient.patch<Level>(`/levels/${levelId}`, data)
  },

  deleteLevel: async (levelId: string) => {
    return apiClient.delete(`/levels/${levelId}`)
  },

  // ============================================
  // Terms  (backend: /levels/:levelId/terms)
  // ============================================
  getTerms: async (levelId: string) => {
    return apiClient.get<Term[]>(`/levels/${levelId}/terms`)
  },

  getTerm: async (levelId: string, termId: string) => {
    return apiClient.get<Term>(`/levels/${levelId}/terms/${termId}`)
  },

  createTerm: async (levelId: string, data: CreateTermRequest) => {
    return apiClient.post<Term>(`/levels/${levelId}/terms`, data)
  },

  updateTerm: async (levelId: string, termId: string, data: UpdateTermRequest) => {
    return apiClient.patch<Term>(`/levels/${levelId}/terms/${termId}`, data)
  },

  deleteTerm: async (levelId: string, termId: string) => {
    return apiClient.delete(`/levels/${levelId}/terms/${termId}`)
  },

  // ============================================
  // Members / Users
  // ============================================
  getMembers: async (organizationId: string, params: GetMembersParams = {}) => {
    return apiClient.get<PaginatedResult<OrganizationMembership>>(
      `/organizations/${organizationId}/members${buildQuery(params as Record<string, unknown>)}`
    )
  },

  getOrganizationUsers: async (organizationId: string, params: GetMembersParams = {}) => {
    return apiClient.get<PaginatedResult<OrganizationMembership>>(
      `/organizations/${organizationId}/members/all${buildQuery(params as Record<string, unknown>)}`
    )
  },

  getMemberDetails: async (organizationId: string, userId: string) => {
    return apiClient.get<OrganizationMembership>(
      `/organizations/${organizationId}/members/${userId}`
    )
  },

  addMember: async (organizationId: string, data: AddMemberRequest) => {
    return apiClient.post(`/organizations/${organizationId}/members`, data)
  },

  updateMemberRole: async (
    organizationId: string,
    userId: string,
    data: UpdateMemberRoleRequest
  ) => {
    return apiClient.patch(
      `/organizations/${organizationId}/members/${userId}/role`,
      data
    )
  },

  removeMember: async (organizationId: string, userId: string) => {
    return apiClient.delete(`/organizations/${organizationId}/members/${userId}`)
  },

  // Search users by email (to add as members)
  searchUsers: async (email: string) => {
    return apiClient.get<User[]>(`/users/search${buildQuery({ email })}`)
  },

  // ============================================
  // Courses (org)
  // ============================================
  addCourses: async (organizationId: string, courseIds: string[]) => {
    return apiClient.post(`/organizations/${organizationId}/courses`, { courseIds })
  },
}
