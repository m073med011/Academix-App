import { NextResponse } from "next/server"
import { z } from "zod"

// LMS Backend URL
const LMS_BACKEND_URL =
  process.env.LMS_BACKEND_URL || "http://localhost:5000/api"

// Validation schema for verify email request
const VerifyEmailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  code: z.string().length(6, "Code must be 6 digits"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsedData = VerifyEmailSchema.safeParse(body)

    // Validate request data
    if (!parsedData.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsedData.error.issues },
        { status: 400 }
      )
    }

    const { email, code } = parsedData.data

    // Forward request to LMS Backend
    const response = await fetch(`${LMS_BACKEND_URL}/auth/email-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        otp: code,
      }),
    })

    const data = await response.json()

    // Handle backend errors
    if (!response.ok || !data.success) {
      const errorMessage = data.error || data.message || "Verification failed"

      return NextResponse.json(
        { message: errorMessage },
        { status: response.status || 400 }
      )
    }

    // Successful verification returns tokens
    return NextResponse.json(
      {
        success: true,
        message: data.message || "Email verified successfully",
        user: {
          id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.imageProfileUrl || null,
        },
        accessToken: data.accessToken || data.token,
        refreshToken: data.refreshToken,
        organizations: data.organizations || [],
        activeOrganizationId: data.activeOrganizationId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { message: "An error occurred during email verification" },
      { status: 500 }
    )
  }
}
