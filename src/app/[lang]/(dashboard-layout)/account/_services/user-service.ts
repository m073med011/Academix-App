import type { ApiResponse, Organization, User, UserProfile } from "@/types/api"

import { ApiClientError, apiClient } from "@/lib/api-client"

// User profile update request type
interface UpdateProfileRequest {
  name?: string
  imageProfileUrl?: string
}

// Change password request type
interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// User service for client-side user operations
export const userService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>("/users/profile")

    if (response.success && response.data) {
      return response.data
    }

    throw new ApiClientError("Failed to get profile", 400)
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.patch<User>("/users/profile", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new ApiClientError("Failed to update profile", 400)
  },

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const response = await apiClient.post<void>("/users/change-password", data)

    if (!response.success) {
      throw new ApiClientError("Failed to change password", 400)
    }
  },

  /**
   * Search users by email (for chat, etc.)
   */
  async searchUsers(query: string): Promise<User[]> {
    const response = await apiClient.get<User[]>(
      `/users/search?email=${encodeURIComponent(query)}`
    )

    if (response.success && response.data) {
      return response.data
    }

    return []
  },

  /**
   * Get user's organizations
   */
  async getOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<Organization[]>("/users/organizations")

    if (response.success && response.data) {
      return response.data
    }

    return []
  },

  /**
   * Disable user account
   */
  async disableAccount(): Promise<void> {
    const response = await apiClient.patch<void>("/users/account/disable")

    if (!response.success) {
      throw new ApiClientError("Failed to disable account", 400)
    }
  },

  /**
   * Delete user account permanently
   */
  async deleteAccount(): Promise<void> {
    const response = await apiClient.delete<void>("/users/account")

    if (!response.success) {
      throw new ApiClientError("Failed to delete account", 400)
    }
  },

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("image", file)

    const response = await apiClient.upload<{ imageUrl: string }>(
      "/users/profile/image",
      formData
    )

    if (response.success && response.data) {
      return response.data.imageUrl
    }

    throw new ApiClientError("Failed to upload profile image", 400)
  },
}

// Server-side user service
export async function serverUserService(accessToken: string) {
  const API_URL = process.env.LMS_BACKEND_URL || "http://localhost:5000/api"

  return {
    /**
     * Get user profile (server-side)
     */
    async getProfile(): Promise<ApiResponse<UserProfile>> {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      return response.json()
    },

    /**
     * Get user's organizations (server-side)
     */
    async getOrganizations(): Promise<ApiResponse<Organization[]>> {
      const response = await fetch(`${API_URL}/users/organizations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      return response.json()
    },
  }
}

export { ApiClientError }
