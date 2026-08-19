"use client"

import { useEffect } from "react"
import { SessionProvider, signOut, useSession } from "next-auth/react"

import type { SessionProviderProps } from "next-auth/react"

/**
 * Watches the session for a "RefreshTokenError" — this means the access token
 * expired AND the refresh token also failed (or was itself expired).
 * When detected, the user is automatically signed out and redirected to /auth.
 */
function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.error === "RefreshTokenError") {
      // Token refresh failed — force sign-out so the user can re-authenticate
      signOut({ callbackUrl: "/auth" })
    }
  }, [session?.error])

  return <>{children}</>
}

export const NextAuthProvider = ({
  children,
  ...props
}: SessionProviderProps) => {
  return (
    <SessionProvider refetchOnWindowFocus={false} {...props}>
      <SessionGuard>{children}</SessionGuard>
    </SessionProvider>
  )
}
