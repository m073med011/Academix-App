import type {
  CreatePaymentRequest,
  Payment,
  PaymentResponse,
} from "@/types/api"

import { ApiClientError, apiClient } from "@/lib/api-client"

// Payment service for payment processing
export const paymentService = {
  /**
   * Initiate checkout for cart or single course
   */
  async initiateCheckout(data: CreatePaymentRequest): Promise<PaymentResponse> {
    const response = await apiClient.post<PaymentResponse>(
      "/payments/checkout",
      data
    )

    if (response.success && response.data) {
      return response.data
    }

    throw new ApiClientError("Failed to initiate checkout", 400)
  },

  /**
   * Create payment and initiate checkout (legacy)
   * @deprecated Use initiateCheckout instead
   */
  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    return this.initiateCheckout(data)
  },

  /**
   * Get payment details by ID
   */
  async getPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/payments/${paymentId}`)

    if (response.success && response.data) {
      return response.data
    }

    throw new ApiClientError("Payment not found", 404)
  },

  /**
   * Get user's payment history
   */
  async getPaymentHistory(): Promise<Payment[]> {
    const response = await apiClient.get<Payment[]>("/payments")

    if (response.success && response.data) {
      return response.data
    }

    return []
  },

  /**
   * Validate discount code
   */
  async validateDiscountCode(
    code: string,
    courseIds: string[]
  ): Promise<{
    valid: boolean
    discountAmount: number
    message?: string
  }> {
    try {
      const response = await apiClient.post<{
        valid: boolean
        discountAmount: number
        message?: string
      }>("/discounts/validation", {
        code,
        courseIds,
      })

      if (response.success && response.data) {
        return response.data
      }

      throw new ApiClientError("Invalid discount code", 400)
    } catch (error) {
      if (error instanceof ApiClientError) {
        return {
          valid: false,
          discountAmount: 0,
          message: error.message,
        }
      }
      throw error
    }
  },

  /**
   * Manually verify and complete payment (fallback for webhook)
   */
  async manuallyVerifyPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.post<Payment>(
      `/payments/verify/${paymentId}`,
      {}
    )

    if (response.success && response.data) {
      return response.data
    }

    throw new ApiClientError("Payment verification failed", 400)
  },
}

export { ApiClientError }
