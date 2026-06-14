import type { ApiError, ApiResponse } from "@/types/api"
import { signOut } from "next-auth/react"

// API Client Configuration
const API_BASE_URL =
  process.env.LMS_BACKEND_URL ||
  process.env.NEXT_PUBLIC_LMS_BACKEND_URL ||
  "http://localhost:5000/api"

// Request configuration type
interface RequestConfig extends RequestInit {
  skipAuth?: boolean
  skipRefresh?: boolean
}

// Main API client class
class ApiClient {
  private baseUrl: string
  private tokenPromise: Promise<string | null> | null = null
  private cachedToken: string | null = null
  private tokenExpiresAt: number = 0

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  public async getAccessToken(): Promise<string | null> {
    const now = Date.now()
    
    // Return cached token if valid (cache for 10 seconds to deduplicate bursts)
    if (this.cachedToken && this.tokenExpiresAt > now) {
      return this.cachedToken
    }

    // If a fetch is already in progress, wait for it
    if (this.tokenPromise) {
      return this.tokenPromise
    }

    // Start a new fetch
    this.tokenPromise = (async () => {
      try {
        const res = await fetch("/api/auth/token")
        if (res.ok) {
          const data = (await res.json()) as { accessToken?: string }
          if (data.accessToken) {
            this.cachedToken = data.accessToken
            this.tokenExpiresAt = Date.now() + 10000 // Cache for 10 seconds
            return data.accessToken
          }
        }
        return null
      } catch {
        return null
      } finally {
        this.tokenPromise = null
      }
    })()

    return this.tokenPromise
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      skipAuth = false,
      skipRefresh: _skipRefresh = false,
      ...fetchConfig
    } = config

    const url = `${this.baseUrl}${endpoint}`
    // Use Headers API for better type safety
    const headers = new Headers(fetchConfig.headers)
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }

    // Add authorization header if not skipped and token exists
    if (!skipAuth && typeof window !== "undefined") {
      try {
        const token = await this.getAccessToken()
        if (token) {
          headers.set("Authorization", `Bearer ${token}`)
        }
      } catch (_e) {
        // Ignore token fetch errors
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
      })

      // Handle 401 - Token expired and refresh failed
      // Clear cached token and sign the user out automatically
      if (response.status === 401 && !skipAuth) {
        this.cachedToken = null
        this.tokenExpiresAt = 0
        if (typeof window !== "undefined") {
          signOut({ callbackUrl: "/auth" })
        }
        throw new ApiClientError("Session expired. Please login again.", 401)
      }

      const data = (await response.json()) as ApiResponse<T> & {
        error?: string
      }

      if (!response.ok) {
        throw new ApiClientError(
          data.error || data.message || "Request failed",
          response.status,
          data as unknown as ApiError
        )
      }

      return data
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error
      }

      throw new ApiClientError(
        error instanceof Error ? error.message : "Network error",
        0
      )
    }
  }

  // HTTP Methods
  async get<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" })
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" })
  }

  // File upload with multipart form data
  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const {
      skipAuth = false,
      skipRefresh: _skipRefresh = false,
      ...fetchConfig
    } = config || {}

    const url = `${this.baseUrl}${endpoint}`

    // Use Headers API
    const headers = new Headers(fetchConfig.headers)
    // Don't set Content-Type for FormData - browser will set it with boundary
    headers.delete("Content-Type")

    if (!skipAuth && typeof window !== "undefined") {
      try {
        const token = await this.getAccessToken()
        if (token) {
          headers.set("Authorization", `Bearer ${token}`)
        }
      } catch (_e) {
        // Ignore token fetch errors
      }
    }

    const response = await fetch(url, {
      ...fetchConfig,
      method: "POST",
      headers,
      body: formData,
    })

    const data = (await response.json()) as ApiResponse<T> & { error?: string }

    if (!response.ok) {
      throw new ApiClientError(
        data.error || data.message || "Upload failed",
        response.status,
        data as unknown as ApiError
      )
    }

    return data
  }
}

// Custom error class for API errors
export class ApiClientError extends Error {
  public statusCode: number
  public data?: ApiError

  constructor(message: string, statusCode: number, data?: ApiError) {
    super(message)
    this.name = "ApiClientError"
    this.statusCode = statusCode
    this.data = data
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401
  }

  isForbidden(): boolean {
    return this.statusCode === 403
  }

  isNotFound(): boolean {
    return this.statusCode === 404
  }

  isValidationError(): boolean {
    return this.statusCode === 400
  }

  isConflict(): boolean {
    return this.statusCode === 409
  }

  isServerError(): boolean {
    return this.statusCode >= 500
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for custom instances
export { ApiClient }
