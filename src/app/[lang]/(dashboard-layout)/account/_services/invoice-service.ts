import { ApiClientError, apiClient } from "@/lib/api-client"

export interface Invoice {
  _id: string
  invoiceNumber: string
  paymentId: string
  userId: string
  courseIds: string[]
  amount: number
  currency: string
  paymentMethod: string
  billingData: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    address?: string
    city?: string
    country?: string
  }
  items: Array<{
    courseId: string
    courseName: string
    price: number
    quantity: number
  }>
  subtotal: number
  discountAmount: number
  tax: number
  total: number
  status: string
  issuedAt: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export const invoiceService = {
  /**
   * Get all invoices for current user
   */
  async getInvoices(): Promise<Invoice[]> {
    const response = await apiClient.get<Invoice[]>("/invoices")

    if (response.success && response.data) {
      return response.data
    }

    return []
  },

  /**
   * Get invoice by ID
   */
  async getInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`/invoices/${id}`)

    if (response.success && response.data) {
      return response.data
    }

    throw new ApiClientError("Invoice not found", 404)
  },

  /**
   * Get invoice by invoice number
   */
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(
      `/invoices/number/${invoiceNumber}`
    )

    if (response.success && response.data) {
      return response.data
    }

    throw new ApiClientError("Invoice not found", 404)
  },
}

export { ApiClientError }
