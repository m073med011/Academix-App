import type {
  ApiResponse,
  ForgotPasswordRequest,
  GenerateOTPRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResendOTPRequest,
  ResetPasswordRequest,
  User,
  VerifyEmailRequest,
  VerifyOTPRequest,
} from "@/types/api"

import { ApiClientError, apiClient } from "@/lib/api-client"

// Auth service for client-side authentication operations
export const authService = {
  /**
   * Login with email and password
   */
  async login(
    credentials: LoginRequest
  ): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<{
      success: boolean
      token: string
      refreshToken: string
      user: User
    }>("/auth/login", credentials, { skipAuth: true })

    if (response.success && response.data) {
      const { user, token } = response.data
      // Token storage handled by NextAuth
      return { user, token }
    }

    throw new ApiClientError("Login failed", 401)
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<User> {
    const response = await apiClient.post<{
      success: boolean
      requiresEmailVerification?: boolean
      user: User
      message?: string
    }>("/auth/register", data, { skipAuth: true })

    if (response.success && response.data) {
      return response.data.user
    }

    throw new ApiClientError("Registration failed", 400)
  },

  /**
   * Logout - clear tokens and invalidate session
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout")
    } catch {
      // Ignore errors during logout
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me")

    if (response.success && response.data) {
      return response.data
    }

    throw new ApiClientError("Failed to get current user", 401)
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{
    accessToken: string
    refreshToken?: string
  }> {
    // Refresh is handled automatically by NextAuth on the server
    // We just return the current token via the API route
    const token = await apiClient.getAccessToken()
    if (!token) throw new ApiClientError("No session", 401)
    return { accessToken: token }
  },

  /**
   * Check if user is authenticated (has valid tokens)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await apiClient.getAccessToken()
    return !!token
  },

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | null> {
    return apiClient.getAccessToken()
  },

  // ============================================
  // Password Reset Flow
  // ============================================

  /**
   * Request password reset - sends OTP to email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    const response = await apiClient.post<void>("/auth/password-reset-request", data, {
      skipAuth: true,
    })

    if (!response.success) {
      throw new ApiClientError("Failed to send reset email", 400)
    }
  },

  /**
   * Reset password with OTP verification
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const response = await apiClient.post<void>("/auth/password-reset", data, {
      skipAuth: true,
    })

    if (!response.success) {
      throw new ApiClientError("Failed to reset password", 400)
    }
  },

  // ============================================
  // Email Verification Flow
  // ============================================

  /**
   * Verify email with OTP
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    const response = await apiClient.post<{
      success: boolean
      token: string
      refreshToken: string
      user: User
    }>("/auth/email-verification", data, {
      skipAuth: true,
    })

    if (!response.success) {
      throw new ApiClientError("Email verification failed", 400)
    }

    if (response.data && response.data.token && response.data.refreshToken) {
      // Tokens handled by NextAuth session update
    }
  },

  // ============================================
  // Two-Factor Authentication
  // ============================================

  /**
   * Enable 2FA for user account
   */
  async enable2FA(password: string): Promise<void> {
    const response = await apiClient.post<void>("/auth/2fa/enable", {
      password,
    })

    if (!response.success) {
      throw new ApiClientError("Failed to enable 2FA", 400)
    }
  },

  /**
   * Confirm 2FA setup with OTP
   */
  async confirm2FA(otp: string): Promise<void> {
    const response = await apiClient.post<void>("/auth/2fa/confirm", { otp })

    if (!response.success) {
      throw new ApiClientError("Failed to confirm 2FA", 400)
    }
  },

  /**
   * Disable 2FA for user account
   */
  async disable2FA(): Promise<void> {
    const response = await apiClient.post<void>("/auth/2fa/disable")

    if (!response.success) {
      throw new ApiClientError("Failed to disable 2FA", 400)
    }
  },

  // ============================================
  // OTP Operations
  // ============================================

  /**
   * Generate OTP code
   */
  async generateOTP(data: GenerateOTPRequest): Promise<void> {
    const response = await apiClient.post<void>("/otp/generate", data, {
      skipAuth: true,
    })

    if (!response.success) {
      throw new ApiClientError("Failed to generate OTP", 400)
    }
  },

  /**
   * Verify OTP code
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<void> {
    const response = await apiClient.post<void>("/otp/verify", data, {
      skipAuth: true,
    })

    if (!response.success) {
      throw new ApiClientError("OTP verification failed", 400)
    }
  },

  /**
   * Resend OTP code
   */
  async resendOTP(data: ResendOTPRequest): Promise<void> {
    const response = await apiClient.post<void>("/otp/resend", data, {
      skipAuth: true,
    })

    if (!response.success) {
      throw new ApiClientError("Failed to resend OTP", 400)
    }
  },

  // ============================================
  // User Lookup (for checking email availability)
  // ============================================

  /**
   * Check if email exists
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await apiClient.get<User>(`/auth/user/${email}`, {
        skipAuth: true,
      })
      return response.success && !!response.data
    } catch {
      return false
    }
  },
}

// Server-side auth service (for API routes)
export async function serverAuthService(accessToken?: string) {
  const API_URL = process.env.LMS_BACKEND_URL || "http://localhost:5000/api"

  return {
    /**
     * Login with credentials (server-side)
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      return response.json()
    },

    /**
     * Register user (server-side)
     */
    async register(data: RegisterRequest): Promise<RegisterResponse> {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      return response.json()
    },

    /**
     * Get current user (server-side)
     */
    async getCurrentUser(): Promise<ApiResponse<User>> {
      if (!accessToken) {
        throw new Error("No access token provided")
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      return response.json()
    },

    /**
     * Refresh token (server-side)
     */
    async refreshToken(
      refreshToken: string
    ): Promise<ApiResponse<RefreshTokenResponse["data"]>> {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })

      return response.json()
    },
  }
}

export { ApiClientError }
