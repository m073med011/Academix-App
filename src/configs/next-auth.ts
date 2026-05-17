import type { UserRole } from "@/types/api"
import type { NextAuthOptions } from "next-auth"

import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

// Extend NextAuth's Session and User interfaces to include custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string | null
      name: string
      avatar: string | null
      status: string
      role: UserRole
      requires2FA?: boolean
      requiresEmailVerification?: boolean
      accountDisabled?: boolean
    }
    accessToken: string
    refreshToken: string
    error?: string
    requires2FA?: boolean
    requiresEmailVerification?: boolean
  }

  interface User {
    id: string
    email: string | null
    name: string
    avatar: string | null
    status: string
    role: UserRole
    accessToken: string
    refreshToken: string
    emailVerified?: boolean
    twoFactorEnabled?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string | null
    name: string
    avatar: string | null
    status: string
    role: UserRole
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    error?: string
    requires2FA?: boolean
    requiresEmailVerification?: boolean
    accountDisabled?: boolean
  }
}

// LMS Backend URL
const LMS_BACKEND_URL = process.env.LMS_BACKEND_URL || ""

// Helper function to refresh access token
async function refreshAccessToken(token: {
  refreshToken: string
  [key: string]: unknown
}) {
  try {
    const response = await fetch(`${LMS_BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error("RefreshTokenError")
    }

    // Calculate new expiration time (150 minutes from now)
    const accessTokenExpires = Date.now() + 150 * 60 * 1000

    return {
      accessToken: data.data.accessToken,
      // Backend may or may not return a new refresh token
      refreshToken: data.data?.refreshToken ?? token.refreshToken,
      accessTokenExpires,
      error: undefined,
    }
  } catch {
    return {
      error: "RefreshTokenError",
    }
  }
}

// Configuration for NextAuth with LMS Backend
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
        token: { type: "text" },
        refreshToken: { type: "text" },
      },
      async authorize(credentials) {
        // Case 1: Token-based login (after 2FA or external verification)
        if (credentials?.token && credentials?.refreshToken) {
          console.log("Authorize: Attempting token-based login")
          try {
            // Verify the token by fetching user profile
            const response = await fetch(`${LMS_BACKEND_URL}/auth/me`, {
              headers: {
                Authorization: `Bearer ${credentials.token}`,
              },
            })
            console.log("Authorize: /auth/me status:", response.status)

            const data = await response.json()
            console.log(
              "Authorize: /auth/me data received:",
              JSON.stringify(data, null, 2)
            )

            if (!response.ok || !data.success) {
              console.error("Authorize: /auth/me failed", data)
              throw new Error("Invalid token")
            }

            // Handle potential response wrapping (e.g. { data: { user: ... } } or { user: ... })
            const userProfile = data.data?.user || data.user || data.data

            if (!userProfile) {
              console.error(
                "Authorize: User profile not found in response",
                data
              )
              throw new Error("Invalid user profile")
            }

            return {
              id: (userProfile.id || userProfile._id).toString(),
              email: userProfile.email,
              name: userProfile.name,
              avatar: userProfile.imageProfileUrl || null,
              status: "ONLINE",
              role: userProfile.role,
              accessToken: credentials.token,
              refreshToken: credentials.refreshToken,
              emailVerified: userProfile.emailVerified,
              twoFactorEnabled: userProfile.twoFactorEnabled,
            }
          } catch (error) {
            console.error("Token login failed:", error)
            return null
          }
        }

        // Case 2: Email/Password Login
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Authenticate against LMS Backend
          const response = await fetch(`${LMS_BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await response.json()

          // DEBUG: Log response details
          console.log("Backend login response status:", response.ok)
          console.log(
            "Backend login response data:",
            JSON.stringify(data, null, 2)
          )

          if (!response.ok || !data.success) {
            console.error("Login failed - response not ok:", data)
            throw new Error(
              data.error || data.message || "Authentication failed"
            )
          }

          // Check if account is disabled
          if (data.accountDisabled) {
            console.log("Account disabled for:", data.user.email)
            throw new Error("ACCOUNT_DISABLED:" + data.user.email)
          }

          // Check if email verification is required
          if (data.requiresEmailVerification) {
            console.log("Email verification required for:", data.user.email)
            throw new Error("EMAIL_VERIFICATION_REQUIRED:" + data.user.email)
          }

          // Check if 2FA is required
          if (data.requires2FA) {
            console.log("2FA required for:", data.user.email)
            throw new Error("2FA_REQUIRED:" + data.user.email)
          }

          // Successful login - backend returns single token field
          if (data.token && data.user) {
            console.log(
              "Login successful with token for user:",
              data.user.email
            )

            return {
              id: data.user.id, // Backend uses 'id' not '_id'
              email: data.user.email,
              name: data.user.name,
              avatar: data.user.imageProfileUrl || null,
              status: "ONLINE",
              role: data.user.role,
              accessToken: data.token, // Use token as accessToken
              refreshToken: data.refreshToken, // Use returned refresh token
              emailVerified: data.user.emailVerified,
              twoFactorEnabled: data.user.twoFactorEnabled,
            }
          }

          console.error("No token in response, data:", data)
          throw new Error("Authentication failed - no token")
        } catch (error) {
          // Re-throw with the original message for proper error handling
          console.error("NextAuth authorize error:", error)
          throw new Error(
            error instanceof Error ? error.message : "Authentication failed"
          )
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (matching refresh token expiry)
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // console.log("JWT Callback Trigger:", trigger)
      // console.log("JWT Token State:", {
      //   requiresEmailVerification: token.requiresEmailVerification,
      //   requires2FA: token.requires2FA,
      //   expires: token.accessTokenExpires,
      // })
      if (user) {
        console.log("User data in JWT callback:", {
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
        })
      }

      // Handle session updates
      if (trigger === "update") {
        // Role update
        if (session?.role) {
          return {
            ...token,
            role: session.role,
          }
        }
        // Verification update (Email or 2FA)
        if (
          session?.verified &&
          session?.accessToken &&
          session?.refreshToken
        ) {
          console.log("Updating session with verified tokens")
          return {
            ...token,
            requiresEmailVerification: false,
            requires2FA: false,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            accessTokenExpires: Date.now() + 150 * 60 * 1000,
            status: "ONLINE",
          }
        }
      }

      // Initial sign in
      if (user && account) {
        // If signing in with Google, we need to authenticate with our backend
        if (account.provider === "google") {
          try {
            // Read role from cookie if available (passed from client)
            const { cookies } = await import("next/headers")
            const cookieStore = await cookies()
            const roleCookie = cookieStore.get("registration_role")
            const role = roleCookie?.value

            const response = await fetch(`${LMS_BACKEND_URL}/auth/register`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                imageProfileUrl: user.image,
                isOAuthUser: true,
                provider: "google",
                role: role, // Pass the role to backend
              }),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
              throw new Error(data.message || "Google authentication failed")
            }

            // Handle disabled account for OAuth
            if (data.accountDisabled) {
              return {
                ...token,
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                status: "ACCOUNT_DISABLED",
                role: data.user.role,
                accountDisabled: true,
                accessToken: "",
                refreshToken: "",
                accessTokenExpires: 0,
              }
            }

            // Handle 2FA requirement for OAuth
            if (data.requires2FA) {
              return {
                ...token,
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                avatar: data.user.imageProfileUrl,
                status: "PENDING_2FA",
                role: data.user.role,
                requires2FA: true,
                accessToken: "", // No access token yet
                refreshToken: "",
                accessTokenExpires: 0,
              }
            }

            // Handle Email Verification requirement for OAuth
            if (data.requiresEmailVerification) {
              return {
                ...token,
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                avatar: data.user.imageProfileUrl,
                status: "PENDING_VERIFICATION",
                role: data.user.role,
                requiresEmailVerification: true,
                accessToken: "", // No access token yet
                refreshToken: "",
                accessTokenExpires: 0,
              }
            }

            return {
              ...token,
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              avatar: data.user.imageProfileUrl,
              status: "ONLINE",
              role: data.user.role,
              requires2FA: false,
              accessToken: data.token,
              refreshToken: data.refreshToken, // Now returned by backend
              accessTokenExpires: Date.now() + 150 * 60 * 1000,
            }
          } catch (error) {
            console.error("Google auth error:", error)
            throw error
          }
        }

        // Credentials login
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          status: user.status,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          // Map backend properties to token properties
          requiresEmailVerification: !user.emailVerified,
          requires2FA: user.twoFactorEnabled,
          // Set expiration to 150 minutes from now
          accessTokenExpires: Date.now() + 150 * 60 * 1000,
        }
      }

      // Return previous token if the access token has not expired yet
      // Refresh 5 minutes before actual expiration
      if (Date.now() < (token.accessTokenExpires as number) - 5 * 60 * 1000) {
        return token
      }

      // If verification is required, do not try to refresh
      if (token.requiresEmailVerification || token.requires2FA) {
        return token
      }

      // Access token has expired, try to refresh it
      const refreshedToken = await refreshAccessToken(
        token as { refreshToken: string }
      )
      return {
        ...token,
        ...refreshedToken,
      }
    },

    async session({ session, token }) {
      // console.log("Session Callback Token State:", {
      //   requiresEmailVerification: token.requiresEmailVerification,
      //   requires2FA: token.requires2FA,
      // })
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          avatar: token.avatar,
          status: token.status,
          role: token.role,
          requires2FA: token.requires2FA,
          requiresEmailVerification: token.requiresEmailVerification,
          accountDisabled: (token as any).accountDisabled,
        }
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
        session.error = token.error
      }

      return session
    },
  },
  events: {
    async signOut() {
      // Optionally call backend logout endpoint
      // This is handled by the signOut callback in the frontend
    },
  },
}
