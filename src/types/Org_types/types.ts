import type { BaseEntity, MembershipStatus, User } from "@/types/api"

// ============================================
// Organization Types
// ============================================

export interface OrganizationSettings {
  _id?: string
  allowMultipleLevels?: boolean
  requireTermAssignment?: boolean
  allowStudentSelfEnroll?: boolean
}

export interface OrganizationPermissions {
  canManageOrganization: boolean
  canManageLevels: boolean
  canManageTerms: boolean
  canManageCourses: boolean
  canManageStudents: boolean
  canManageRoles: boolean
  canRecordAttendance: boolean
  canViewReports: boolean
}

export interface Organization extends BaseEntity {
  name: string
  description?: string
  orgcover?: string
  owner: string | User
  creatorId?: string | User
  deletedAt?: string | null
  settings?: OrganizationSettings
  levels?: string[]
  terms?: string[]
}

export interface OrganizationRole extends BaseEntity {
  organizationId: string
  name: string
  permissions: OrganizationPermissions
  description?: string
  isSystemRole?: boolean
}

export interface OrganizationMembership extends BaseEntity {
  organizationId: string | Organization
  userId: string | User
  roleId: string | OrganizationRole
  levelId?: string
  termId?: string
  joinedDate?: string
  joinedAt?: string
  status: MembershipStatus | Lowercase<MembershipStatus>
}

export interface CreateOrganizationRequest {
  name: string
  description?: string
  orgcover?: string
  settings?: OrganizationSettings
}
